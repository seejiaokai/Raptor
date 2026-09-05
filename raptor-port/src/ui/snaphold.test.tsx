// @vitest-environment jsdom
/* A REPAINT THAT WRITES NOTHING WRITES NO scrollLeft (owner's iPhone recording,
   5 Sep 26 — "scrolling left and right the pages don't fit"). The palette's
   day-follow fires a repaint ~110ms after a swipe settles; that repaint changed
   no day, yet the B54 hold wrote root.scrollLeft back to itself. Chromium
   re-snaps after a programmatic scroll, iOS Safari does not — so on the phone
   the write stopped the still-settling snap where it stood and days rested
   60–100px off. jsdom cannot snap, but it can count the writes. */
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, loadWeek } from '../state/store'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import * as view from '../state/view'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const spyScroll = (el: HTMLElement, at: number) => {
  const writes: number[] = []; let cur = at
  Object.defineProperty(el, 'scrollLeft', { get: () => cur, set: (v: number) => { writes.push(v); cur = v }, configurable: true })
  return writes
}

beforeAll(async () => {
  initStore()
  Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true, writable: true })
  const host = document.createElement('div'); document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
})
afterEach(async () => { if (CURWEEK !== '13/07/2026') await act(async () => { loadWeek('13/07/2026') }) })

for (const [page, id] of [['editsched', 'eWeek'], ['viewsched', 'vWeek']] as const) {
  describe(`${page}: the week's scroll is written only by a repaint that rewrote the week`, () => {
    it('the palette day-follow (no day changed) leaves scrollLeft untouched', async () => {
      await act(async () => { view.setPage(page); notify() })
      await act(async () => { notify() })                       // consume any carried landing first
      const w = document.getElementById(id)!
      const writes = spyScroll(w, 402)
      await act(async () => { view.setRosDay(2); notify() })     // what rosDayFollow does after a swipe settles
      await act(async () => { notify() })                       // and a plain store tick
      expect(writes).toEqual([])
    })
    it('a repaint that rewrote a day still holds the position (B54)', async () => {
      await act(async () => { view.setPage(page); notify() })
      await act(async () => { notify() })
      const w = document.getElementById(id)!
      const writes = spyScroll(w, 402)
      DAYS[1].ground = DAYS[1].ground || []
      DAYS[1].ground.push({ prog: 'DUTY SPELL', str: '0900', end: '1000', who: '' })
      await act(async () => { notify() })
      expect(writes).toEqual([402])
      DAYS[1].ground.pop()
      await act(async () => { notify() })
      expect(writes).toEqual([402, 402])
    })
  })
}
