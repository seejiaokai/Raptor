// @vitest-environment jsdom
/* THE NEXT-WEEK PREVIEW AND A MAN'S SANS DATE (owner D2313, 22 Nov 26 — "on every screen"; Astra's scenario design of the
   same day, candidates B and C). Two faults, each failing before its fix:
   B — View-only Sched's preview draws a PUBLISHED day of next week as it went out (D1010), but drew each man's puck from
       today's record: a man made SANS after that day was published wore the purple SANS line there before any amendment
       (D186 — a man's posting on his puck stays as published until the next amendment);
   C — the preview is cached by a key that knew nothing of a SANS change, so a tick on Quals left a preview already drawn
       showing the old puck until the week was reloaded. */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, loadWeek, afterSchedMutate } from '../state/store'
import { signOf, setDayApproved } from '../engine/publish'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { PEOPLE } from '../engine/people'
import { updatePersonField } from '../state/quals-write'
import * as view from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root
/* Hex's pucks on the preview's Monday of the page in view (a preview puck carries no person id — found by its callsign) */
const hexOn = (page: 'v' | 'e') => [...host.querySelectorAll(`#${page}Week section.day.peek[data-peek-day="0"] .puck`)]
  .filter(n => (n.textContent || '').includes('Hex')).map(n => n.className)

beforeAll(async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))                       // Wed 15 Jul 26: a tick made now counts from this day
  initStore()
  Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true, writable: true })
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
})
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
  vi.useRealTimers()
})
afterEach(async () => {
  if (CURWEEK !== '13/07/2026') await act(async () => { loadWeek('13/07/2026') })
})

describe('D2313 — the next-week preview and a SANS tick', () => {
  it('C: a preview already drawn follows a tick made on Quals, without the week being reloaded', async () => {
    await act(async () => { loadWeek('20/07/2026') })
    await act(async () => { (DAYS[0] as any).ground.push({ prog: 'BRIEFING', str: '1400', end: '1500', who: 'rocky' }); afterSchedMutate() })
    await act(async () => { loadWeek('13/07/2026') })
    await act(async () => { view.setPage('editsched'); notify() })
    const before = hexOn('e')
    expect(before.length, 'the preview draws Hex on next Monday').toBeGreaterThan(0)
    expect(before.some(c => / san\b/.test(c)), 'an ordinary WSO before the tick').toBe(false)
    await act(async () => { expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); notify() })
    expect((PEOPLE as any).rocky.sanFrom).toBe('2026-07-15')
    expect(hexOn('e').every(c => / san\b/.test(c)), 'SANS from Wed 15 Jul: next Monday draws his SANS line at once').toBe(true)
    await act(async () => { expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); notify() })
    expect(hexOn('e').some(c => / san\b/.test(c)), 'unticked the same day: the line goes at once').toBe(false)
  })

  it('B: a next-week day published before the tick keeps his puck as published on View-only Sched; Edit Schedule shows the working copy', async () => {
    await act(async () => { loadWeek('20/07/2026') })
    await act(async () => {
      if (!(DAYS[0] as any).ground.some((g: any) => g.who === 'rocky')) (DAYS[0] as any).ground.push({ prog: 'BRIEFING', str: '1400', end: '1500', who: 'rocky' })
      afterSchedMutate()
      const g = signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
      setDayApproved(0, true)
      afterSchedMutate()
    })
    await act(async () => { loadWeek('13/07/2026') })
    await act(async () => { expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); notify() })   // SANS from Wed 15 Jul
    await act(async () => { view.setPage('viewsched'); notify() })
    const pub = hexOn('v')
    expect(pub.length, 'View-only\'s preview draws Hex on the published Monday').toBeGreaterThan(0)
    expect(pub.some(c => / san\b/.test(c)), 'as published: an ordinary WSO until the next amendment (D186)').toBe(false)
    await act(async () => { view.setPage('editsched'); notify() })
    expect(hexOn('e').every(c => / san\b/.test(c)), 'the working copy: SANS on that Monday').toBe(true)
    await act(async () => { expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); notify() })   // put back
  })
})
