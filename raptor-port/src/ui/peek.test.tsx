// @vitest-environment jsdom
/* THE NEXT-WEEK PEEK PREVIEW (ui/peek.ts) — desktop-only, inert trailing
   `.day.peek` sections that show next week and land a click on it. Driven
   through the real App, the same shape swipeweeks.test.tsx and pan.test.tsx
   already use for a width-gated surface: jsdom has no layout, so "desktop"
   here means window.innerWidth alone, exactly what peekKey() itself reads. */
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, loadWeek, writeSlot, afterSchedMutate } from '../state/store'
import { markStructuralAdd } from '../engine/publish'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { weekBundle } from '../engine/weeks-data'
import * as view from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]

beforeAll(async () => {
  initStore()
  /* desktop width, stubbed the way pan.test.tsx/swipeweeks.test.tsx do —
     jsdom's own default (1024) already clears the 820px gate, but this is
     explicit so the suite does not silently depend on that default. */
  Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true, writable: true })
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
})

/* every test below is free to load a different week; return to the seed week
   so the next test starts from the same place, the same discipline
   crossweek.test.ts uses for the same reason (module state, not per-test). */
afterEach(async () => {
  if (CURWEEK !== '13/07/2026') await act(async () => { loadWeek('13/07/2026') })
})

describe('desktop: the preview strip itself', () => {
  it('#vWeek carries exactly 7 peek days, indexed 0..6, dated as next week, and inert', () => {
    const peeks = $$('#vWeek section.day.peek[data-peek-day]')
    expect(peeks.length).toBe(7)
    expect(peeks.map(p => p.dataset.peekDay)).toEqual(['0', '1', '2', '3', '4', '5', '6'])
    /* next week off the seed week (13/07) is the authored second week */
    expect(peeks.map(p => p.querySelector('.dt')!.textContent)).toEqual(weekBundle('20/07/2026').dates)
    /* nothing an existing click/drag/highlight delegate keys on */
    const whole = peeks.map(p => p.outerHTML).join('')
    expect(whole).not.toContain('data-day=')
    expect(whole).not.toContain('contenteditable')
    expect(whole).not.toContain('draggable')
    expect(whole).not.toContain('data-drag')
    expect(whole).not.toContain('data-slot')
    expect(whole).not.toContain('data-person')
  })

  it('only the first peek day carries the "Next week" label', () => {
    const peeks = $$('#vWeek section.day.peek[data-peek-day]')
    expect(peeks[0]!.textContent).toContain('Next week')
    peeks.slice(1).forEach(p => expect(p.textContent).not.toContain('Next week'))
  })

  it('#eWeek carries the same seven peek days', async () => {
    await act(async () => { view.setPage('editsched'); notify() })
    try {
      const peeks = $$('#eWeek section.day.peek[data-peek-day]')
      expect(peeks.length).toBe(7)
      expect(peeks.map(p => p.dataset.peekDay)).toEqual(['0', '1', '2', '3', '4', '5', '6'])
    } finally {
      await act(async () => { view.setPage('viewsched'); notify() })
    }
  })
})

describe('phone width shows no preview at all', () => {
  afterEach(async () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true, writable: true })
    await act(async () => { notify() })   // repaint back to desktop for the next describe block
  })

  it('#vWeek mounts zero peek nodes once the width crosses to phone', async () => {
    Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true, writable: true })
    await act(async () => { notify() })
    expect($$('#vWeek .day.peek').length).toBe(0)
    expect($$('#vWeek .day[data-day]').length).toBe(7)   // the live week itself is untouched
  })
})

describe('clicking a peek day lands and loads', () => {
  it('routes through routeClick, sets PEEKLAND then consumes it, and CURWEEK becomes next week', async () => {
    expect(CURWEEK).toBe('13/07/2026')
    const day3 = $('#vWeek section.day.peek[data-peek-day="3"]')!
    expect(day3).toBeTruthy()
    await act(async () => { day3.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    expect(CURWEEK).toBe('20/07/2026')
    /* consumed in the same repaint the click triggered — nothing left armed */
    expect(view.PEEKLAND).toBeNull()
  })
})

describe('perf-B: an ordinary edit repaint does not rebuild the peek nodes', () => {
  it('the peek day elements keep their identity across a same-week repaint', async () => {
    const before = $$('#vWeek section.day.peek[data-peek-day]')
    expect(before.length).toBe(7)
    await act(async () => { writeSlot('0.0.0.0.p', 'bane') })
    const after = $$('#vWeek section.day.peek[data-peek-day]')
    expect(after.length).toBe(7)
    before.forEach((el, i) => expect(after[i], `peek day ${i} was rebuilt`).toBe(el))
  })
})

describe('the preview tracks whichever week is actually next', () => {
  it('after loadWeek the preview shows the NEW next week', async () => {
    await act(async () => { loadWeek('20/07/2026') })
    const dts = $$('#vWeek section.day.peek .dt').map(el => el.textContent)
    /* 20/07's own next week (27/07) is unauthored — a blank seed */
    expect(dts).toEqual(weekBundle('27/07/2026').dates)
  })
})

describe('the preview reads the session stash, not just the pure seed', () => {
  it('an edit made while next week was loaded still shows in its preview after leaving and returning', async () => {
    await act(async () => { loadWeek('20/07/2026') })   // load what is "next week" from 13/07's view
    const rows = (DAYS[0] as any).dutywaves[0].rows
    const ri = rows.length
    await act(async () => {
      rows.push({ role: 'ZZPEEKTEST', id: '', str: '0900', end: '1000' })
      markStructuralAdd(`dr:0.0.${ri}.role`)
      afterSchedMutate()
    })
    await act(async () => { loadWeek('13/07/2026') })   // stashes the edited 20/07 on the way out
    const mon = $('#vWeek section.day.peek[data-peek-day="0"]')!
    expect(mon.textContent).toContain('ZZPEEKTEST')
  })
})
