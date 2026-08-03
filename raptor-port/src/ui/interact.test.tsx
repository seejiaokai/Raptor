// @vitest-environment jsdom
/* View-week interactivity — the tfin B14 group, driven through the React app:
   puck click opens that person's issue boxes, warning strips expand inline,
   a focused warning lights its crew (solid on the day, dashed echoes on the
   others), highlight chips and search, the warning pill, blank-space clear. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { validate, WARN } from '../engine/validate'
import { personWarnDays } from '../engine/avail'
import { isSpecial } from '../engine/people'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  validate()
})

describe('puck selection (tfin B14)', () => {
  it('click select — and it opens that person\'s issue boxes on every flagged day', async () => {
    await click($('#vWeek .puck[data-person="bane"]'))
    expect($$('#vWeek .puck.sel').length).toBeGreaterThanOrEqual(1)
    const days = personWarnDays('bane')
    expect($$('#vWeek .dwbox.open').length).toBe(days.length)
    expect($$('#vWeek .dwbox.open').every(b => b.classList.contains('pfoc'))).toBe(true)
    expect($$('#vWeek .dwbox.open .dwwho').every(x => x.textContent === 'Bane')).toBe(true)
  })

  it('opened boxes are the days that person is flagged on', () => {
    const days = personWarnDays('bane')
    expect($$('#vWeek .dwbox.open').every(b => days.includes(+(b.closest('.day') as HTMLElement).dataset.day!))).toBe(true)
  })

  it('clicking the same puck again clears it', async () => {
    await click($('#vWeek .puck[data-person="bane"]'))
    expect($$('#vWeek .dwbox.open').length).toBe(0)
    expect($$('#vWeek .puck.sel').length).toBe(0)
  })

  it('clicking the week background un-clicks everybody', async () => {
    await click($('#vWeek .puck[data-person="bane"]'))
    expect($$('#vWeek .puck.sel').length).toBeGreaterThan(0)
    await click($('#vWeek'))
    expect($$('#vWeek .puck.sel').length).toBe(0)
  })
})

describe('warning strips (tfin B14)', () => {
  it('strips start collapsed', () => {
    expect($$('#vWeek .dwlist').length).toBe(0)
  })

  it('strip expands inline, highlights affected pucks, dims the rest', async () => {
    await click($('#vWeek .daywarn[data-daywarn]'))
    const box = $('#vWeek .dwbox.open')
    expect(box && box.querySelectorAll('.witem[data-wdi]').length).toBeGreaterThanOrEqual(1)
    expect($$('#vWeek .puck.wfoc').length).toBeGreaterThanOrEqual(1)
    expect($$('#vWeek .puck.dim').length).toBeGreaterThan(0)
  })

  it('focusing one warning lights only its crew — solid on the day, echoes elsewhere', async () => {
    const it0 = $('#vWeek .dwlist .witem[data-wdi]')
    const wdi = it0.dataset.wdi!
    const cs = (it0.querySelector('b')!.textContent || '').split(', ').filter(Boolean)
    await click(it0)
    expect($$('#vWeek .dwlist .witem.on').length).toBe(1)
    const lit = $$('#vWeek .puck.wfoc')
    expect(lit.length).toBeGreaterThan(0)
    expect(lit.every(x => cs.includes(x.querySelector('.nm')!.textContent!))).toBe(true)
    expect(lit.filter(x => !x.classList.contains('echo'))
      .every(x => (x.closest('.day') as HTMLElement).dataset.day === wdi)).toBe(true)
    expect(lit.filter(x => x.classList.contains('echo'))
      .every(x => (x.closest('.day') as HTMLElement).dataset.day !== wdi
        && cs.includes(x.querySelector('.nm')!.textContent!))).toBe(true)
  })

  it('clear-focus steps back, and the strip collapses again', async () => {
    expect($('#vWeek .dwclear')).toBeTruthy()
    await click($('#vWeek .dwclear'))
    expect($$('#vWeek .dwclear').length).toBe(0)
    expect($$('#vWeek .witem.on').length).toBe(0)
    const open = $('#vWeek .dwbox.open .daywarn') || $('#vWeek .daywarn[data-daywarn]')
    await click(open)
    expect($$('#vWeek .dwlist').length).toBe(0)
    expect($$('#vWeek .puck.wfoc').length).toBe(0)
  })

  it('the warning pill expands every flagged day (tfin: blocking pill expands days)', async () => {
    await click($('#warnBtn'))
    expect($$('#vWeek .dwbox.open').length).toBeGreaterThanOrEqual(1)
    for (let g = 0; g < 10; g++) {
      const s = $('#vWeek .dwbox.open .daywarn'); if (!s) break
      await click(s)
    }
    expect($$('#vWeek .dwlist').length).toBe(0)
  })
})

describe('highlight chips and search (tfin)', () => {
  it('INS hl', async () => {
    const ins = $$('.fchip[data-hl]').find(b => b.dataset.hl === 'INS')!
    await click(ins)
    expect($$('#vWeek .puck.hl').length).toBeGreaterThan(0)
    await click(ins)
    expect($$('#vWeek .puck.hl').length).toBe(0)
  })

  it('search highlights by callsign and dims the rest', async () => {
    const inp = $('#searchV') as HTMLInputElement
    await act(async () => {
      inp.value = 'bane'
      inp.dispatchEvent(new Event('input', { bubbles: true }))
    })
    expect($$('#vWeek .puck.hl').length).toBeGreaterThan(0)
    expect($$('#vWeek .puck.hl').every(x => x.dataset.person === 'bane')).toBe(true)
    await act(async () => {
      inp.value = ''
      inp.dispatchEvent(new Event('input', { bubbles: true }))
    })
    expect($$('#vWeek .puck.hl').length).toBe(0)
  })
})

describe('cross-day warning focus (tfin G2)', () => {
  it('a cross-day warning exists in the seed and echoes correctly', async () => {
    validate()
    let pick: any = null
    WARN.byDay.forEach((g: any) => {
      if (!g || !g.warns || pick) return
      g.warns.forEach((x: any, ix: number) => {
        if (pick) return
        const ids = (x.who || []).filter((id: any) => !isSpecial(id))
        if (!ids.length) return
        const other = $$('#vWeek .day').some(dy => +dy.dataset.day! !== g.di
          && ids.some((id: any) => dy.querySelector('.puck[data-person="' + id + '"]')))
        if (other) pick = { di: g.di, ix, ids }
      })
    })
    expect(pick).toBeTruthy()
    await click($('#vWeek .day[data-day="' + pick.di + '"] .daywarn'))
    await click($('#vWeek .day[data-day="' + pick.di + '"] .witem[data-wix="' + pick.ix + '"]'))
    const solid = $$('#vWeek .puck.wfoc:not(.echo)')
    const echo = $$('#vWeek .puck.wfoc.echo')
    expect(solid.length).toBeGreaterThanOrEqual(1)
    expect(solid.every(x => +(x.closest('.day') as HTMLElement).dataset.day! === pick.di)).toBe(true)
    expect(echo.length).toBeGreaterThanOrEqual(1)
    expect(echo.every(x => +(x.closest('.day') as HTMLElement).dataset.day! !== pick.di)).toBe(true)
    expect(echo.every(x => pick.ids.includes(x.dataset.person))).toBe(true)
    /* clear focus drops the echo too */
    await click($('#vWeek .dwclear'))
    expect($$('#vWeek .puck.wfoc.echo').length).toBe(0)
    for (let g = 0; g < 12; g++) {
      const x = $('#vWeek .dwbox.open .daywarn'); if (!x) break
      await click(x)
    }
  })
})

describe('the stores toggle (sign probe — a store click must earn a pending mark)', () => {
  it('clicking a stchip in edit mode toggles the option and marks st: pending', async () => {
    const { DAYS } = await import('../engine/data')
    const { SCHED } = await import('../engine/publish')
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
    const st = document.querySelector('#eWeek .stchip[data-store]') as HTMLElement
    expect(st, 'a stores chip renders on the edit week').toBeTruthy()
    const [di, gi, li, ai, k] = st.dataset.store!.split('.')
    const a = DAYS[+di!].waves[+gi!].formations[+li!].aircraft[+ai!]
    const was = !!(a.opts && a.opts[k!])
    await click(st)
    expect(!!a.opts[k!]).toBe(!was)
    expect(SCHED.pending[`st:${di}.${gi}.${li}.${ai}`]).toBeTruthy()
    await click(document.querySelector(`#eWeek .stchip[data-store="${st.dataset.store}"]`))
    expect(!!a.opts[k!]).toBe(was)
  })

  it('typing in the bombs box commits on focusout, marks st: pending, and shows on the view week', async () => {
    const { DAYS } = await import('../engine/data')
    const { SCHED } = await import('../engine/publish')
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
    const bo = document.querySelector('#eWeek .bombs[data-bombs]') as HTMLElement
    expect(bo, 'a bombs box renders on the edit week').toBeTruthy()
    const [di, gi, li, ai] = bo.dataset.bombs!.split('.')
    const a = DAYS[+di!].waves[+gi!].formations[+li!].aircraft[+ai!]
    const was = (a.opts && a.opts.bombs) || ''
    bo.textContent = '2 X GBU-38'
    await act(async () => { bo.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
    await act(async () => { await new Promise(r => setTimeout(r, 5)) })
    expect(a.opts.bombs).toBe('2 X GBU-38')
    expect(SCHED.pending[`st:${di}.${gi}.${li}.${ai}`]).toBeTruthy()
    await click($$('.nav a[data-page]').find(x => x.dataset.page === 'viewsched')!)
    const chip = [...document.querySelectorAll('#vWeek .stchip.bomb')].find(x => x.textContent!.includes('2 X GBU-38'))
    expect(chip, 'the view week shows the typed bombs').toBeTruthy()
    a.opts.bombs = was
  })
})
