// @vitest-environment jsdom
/* THE MAIN/SPARE BADGE ON STANDALONE LINES (owner, 24 Aug 26 — "for SC, can I
   have the option to change the line to SPARE from MAIN, vice versa. Either a
   button that goes into remarks. Rather than a default main or spare faded in
   the remarks").

   Before this, the role lived only as the remarks box's faded PLACEHOLDER —
   invisible the moment remarks were typed, and never changeable at all. These
   pins hold the replacement: a solid badge in the remarks cell on every
   surface, a button in edit mode that flips the line, and the engine
   consequences of the flip (scSpare exemption, the pending mark for the next
   AL). Same preamble as board-stores.test.tsx — no shared helper module. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, setPage } from '../state/store'
import { DAYS } from '../engine/data'
import { makeStandalone, scSpare } from '../engine/waves'
import { SCHED } from '../engine/publish'
import { dayHTML } from './html'
import { openScheduler } from './board'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

/* one SC wave planted on Monday; every test re-derives its own indexes */
let WI = -1
beforeAll(async () => {
  initStore()
  const sc = makeStandalone('sc')!
  DAYS[0].waves.push(sc)
  WI = DAYS[0].waves.length - 1
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
})

describe('the MAIN/SPARE badge on an SC line', () => {
  it('edit mode renders a flip BUTTON on every SC line, and the remarks placeholder is plain', () => {
    const h = dayHTML(0, true)
    /* 2 shifts × (2 MAIN + 2 SPARE) = 8 buttons for this wave */
    const btns = h.match(new RegExp(`<button class="sarole[^"]*" data-sarole="0\\.${WI}\\.`, 'g')) || []
    expect(btns.length).toBe(8)
    /* the old behaviour — the role as the remarks box's faded placeholder —
       is GONE: no textarea placeholder says MAIN or SPARE any more */
    expect(h).not.toMatch(/placeholder="(MAIN|SPARE)"/)
  })

  it('view mode renders the same badge read-only — a span, not a button', () => {
    const h = dayHTML(0, false)
    const ros = h.match(new RegExp(`<span class="sarole ro[^"]*">`, 'g')) || []
    expect(ros.length).toBeGreaterThanOrEqual(8)
    expect(h).not.toContain('data-sarole=')
  })

  it('clicking the badge flips the line SPARE -> MAIN, marks it pending, and the engine follows', async () => {
    await act(async () => { setPage('editsched'); notify() })
    const w = DAYS[0].waves[WI], f = w.formations[0]
    const ai = f.aircraft.findIndex((a: any) => a.spare)
    const a = f.aircraft[ai]
    expect(scSpare(w, f, a), 'starts exempt as a SPARE').toBe(true)
    const btn = $(`#eWeek [data-sarole="0.${WI}.0.${ai}"]`)
    expect(btn, 'the badge button is in the live edit DOM').toBeTruthy()
    expect(btn.textContent).toBe('SPARE')
    await click(btn)
    expect(a.spare, 'the flag flipped').toBe(false)
    expect(a.role, 'the label followed').toBe('MAIN')
    expect(scSpare(w, f, a), 'the engine stops exempting the line').toBe(false)
    expect(SCHED.pending[`st:0.${WI}.0.${ai}`], 'the line key is pending for the next AL').toBeTruthy()
    /* and back — the flip is symmetric */
    await click($(`#eWeek [data-sarole="0.${WI}.0.${ai}"]`))
    expect(a.spare).toBe(true)
    expect(scSpare(w, f, a)).toBe(true)
  })

  it('the scheduler board renders the badge too', async () => {
    await act(async () => { setPage('editsched'); notify() })
    await act(async () => { openScheduler(0); notify() })
    const btn = document.querySelector(`#schedBoard [data-sarole="0.${WI}.0.0"], #sbBoard [data-sarole="0.${WI}.0.0"]`) as HTMLElement
    expect(btn, 'the board line carries the same button').toBeTruthy()
    expect(btn.tagName).toBe('BUTTON')
    expect(btn.textContent).toBe('MAIN')
  })

  it('an ordinary flying line renders no badge', () => {
    const h = dayHTML(0, true)
    /* wave 0 is a seeded flying wave — its keys must carry no badge */
    expect(h).not.toMatch(new RegExp(`data-sarole="0\\.0\\.`))
  })
})
