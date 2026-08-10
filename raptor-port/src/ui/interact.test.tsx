// @vitest-environment jsdom
/* View-week interactivity — the tfin B14 group, driven through the React app:
   puck click opens that person's issue boxes, warning strips expand inline,
   a focused warning lights its crew (solid on the day, dashed echoes on the
   others), highlight chips and search, the warning pill, blank-space clear. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, undo } from '../state/store'
import { validate, WARN } from '../engine/validate'
import { personWarnDays } from '../engine/avail'
import { isSpecial } from '../engine/people'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { HOOKS } from '../engine/hooks'
import { HIST, histPush } from '../state/history'
import * as view from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
/* sync counterparts for tests that assert against the model right after the
   click, with no debounce or timer in the way — act() alone flushes React's
   pending updates before it returns, so no await is needed */
const clickSync = (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  act(() => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const clickAttr = (sel: string) => clickSync($(sel))
/* idempotent: if the board is already open on this day (as an earlier test
   in this block left it), no click is issued — that is what lets the
   member-role test find the SAME admin-rendered markup still on screen
   after setSession(), the stale-element scenario canEditSched() guards */
const mountBoard = (di: number) => {
  if (view.CURPAGE !== 'editsched') clickSync($('.nav a[data-page="editsched"]'))
  if (view.SBDAY !== di) clickSync($(`#eWeek .day[data-day="${di}"] .dow.sb-open`))
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
  /* owner, Aug 26: clicking a puck lights up EVERY copy of that person — you
     want to see everywhere the name is planted — while the rest dims */
  it('clicking a puck lights up every copy of that person', async () => {
    await click($('#vWeek .puck[data-person="bane"]'))
    const bane = $$('#vWeek .puck[data-person="bane"]')
    const sel = $$('#vWeek .puck.sel')
    expect(bane.length).toBeGreaterThan(0)
    expect(bane.every(p => p.classList.contains('sel'))).toBe(true)   // all same-name copies
    expect(sel.every(p => p.dataset.person === 'bane')).toBe(true)    // and nobody else
    expect($$('#vWeek .puck.dim').length).toBeGreaterThan(0)          // the rest dims
    await click($('#vWeek'))   // reset for the next test
  })

  /* owner, Aug 26: selecting another puck must dim your own view-as ("you")
     puck too — the passive purple indicator yields to an active selection */
  it('selecting another puck dims your own view-as puck (no lingering "you")', async () => {
    const other = $$('#vWeek .puck[data-person]').find(p => p.dataset.person !== 'bane')
    expect(other, 'a non-me puck to click').toBeTruthy()
    await click(other!)
    const bane = $$('#vWeek .puck[data-person="bane"]')
    expect(bane.length).toBeGreaterThan(0)
    expect(bane.every(p => !p.classList.contains('me'))).toBe(true)
    expect(bane.every(p => p.classList.contains('dim'))).toBe(true)
    await click($('#vWeek'))   // reset for the next test
  })

  it('click select — and it opens that person\'s issue boxes on every flagged day', async () => {
    await click($('#vWeek .puck[data-person="bane"]'))
    expect($$('#vWeek .puck.sel').length).toBe($$('#vWeek .puck[data-person="bane"]').length)
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

  it('and the HIGHLIGHT chips go with it', async () => {
    /* owner, 10 Aug 26: "every puck should be deselected". A chip lights
       pucks exactly as a selection does, but it used to survive a blank
       click — so the board could be cleared and still be lit, with nothing
       on screen explaining what was holding it. */
    const chip = $$('#vWeek, .fchip').length ? $('.fchip[data-hl]') : null
    expect(chip, 'a highlight chip is on the page').toBeTruthy()
    await click(chip)
    expect(chip!.classList.contains('on'), 'the chip lit up').toBe(true)
    expect($$('#vWeek .puck.hl').length, 'and it lit some pucks').toBeGreaterThan(0)
    await click($('#vWeek'))
    expect($('.fchip[data-hl]')!.classList.contains('on'), 'the chip went out').toBe(false)
    expect($$('#vWeek .puck.hl').length, 'and the pucks with it').toBe(0)
  })

  it('and the search box is emptied, not just its effect', async () => {
    /* the input is uncontrolled, so clearing only the state would leave a box
       reading "bane" with nothing lit — worse than not clearing at all */
    const box = $('#searchV') as HTMLInputElement
    expect(box, 'the view week has a search box').toBeTruthy()
    await act(async () => {
      box.value = 'bane'
      box.dispatchEvent(new Event('input', { bubbles: true }))
    })
    expect($$('#vWeek .puck.hl').length, 'the search lit somebody').toBeGreaterThan(0)
    await click($('#vWeek'))
    expect(($('#searchV') as HTMLInputElement).value, 'the box was emptied too').toBe('')
    expect($$('#vWeek .puck.hl').length).toBe(0)
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

describe('stores configs — the C picker (owner, Aug 26; + became C, 7 Aug 26)', () => {
  const editTab = () => $$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!

  it('the C menu adds a config, marks st: pending, and C stays for more', async () => {
    const { DAYS } = await import('../engine/data')
    const { SCHED } = await import('../engine/publish')
    await click(editTab())
    const add = $('#eWeek .stcfg[data-stcfg]')
    expect(add, 'a C button renders on the edit week').toBeTruthy()
    const [di, gi, li, ai] = add.dataset.stcfg!.split('.')
    const a = DAYS[+di!].waves[+gi!].formations[+li!].aircraft[+ai!]; a.opts = a.opts || {}
    a.opts.cl = false; await act(async () => notify())
    await click($(`#eWeek .stcfg[data-stcfg="${di}.${gi}.${li}.${ai}"]`))
    const item = document.querySelector('.stmenu [data-cfg="cl"]') as HTMLElement
    expect(item, 'the menu offers CL').toBeTruthy()
    await click(item)
    expect(a.opts.cl).toBe(true)
    expect(SCHED.pending[`st:${di}.${gi}.${li}.${ai}`]).toBeTruthy()
    expect($(`#eWeek .stchip[data-store="${di}.${gi}.${li}.${ai}.cl"]`), 'the CL chip now shows').toBeTruthy()
    expect($(`#eWeek .stcfg[data-stcfg="${di}.${gi}.${li}.${ai}"]`), 'C remains').toBeTruthy()
    a.opts.cl = false; await act(async () => notify())
  })

  it('clicking an on-chip removes that config', async () => {
    const { DAYS } = await import('../engine/data')
    await click(editTab())
    const chip = $('#eWeek .stchip[data-store]')
    expect(chip, 'an on-chip renders').toBeTruthy()
    const [di, gi, li, ai, k] = chip.dataset.store!.split('.')
    const a = DAYS[+di!].waves[+gi!].formations[+li!].aircraft[+ai!]
    expect(!!a.opts[k!]).toBe(true)
    await click(chip)
    expect(!!a.opts[k!]).toBe(false)
    expect($(`#eWeek .stchip[data-store="${di}.${gi}.${li}.${ai}.${k}"]`), 'the chip is gone').toBeFalsy()
    a.opts[k!] = true; await act(async () => notify())
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

  it('the popup lists EVERY store, marking the ones already on this jet', async () => {
    const { DAYS } = await import('../engine/data')
    const { STORE_CFG } = await import('../engine/stores')
    await click(editTab())
    const add = $('#eWeek .stcfg[data-stcfg]')
    const [di, gi, li, ai] = add.dataset.stcfg!.split('.')
    const a = DAYS[+di!].waves[+gi!].formations[+li!].aircraft[+ai!]; a.opts = a.opts || {}
    a.opts.nav = true; a.opts.cl = false; await act(async () => notify())
    await click($(`#eWeek .stcfg[data-stcfg="${di}.${gi}.${li}.${ai}"]`))
    const items = Array.from(document.querySelectorAll('.stmenu [data-cfg]')) as HTMLElement[]
    expect(items.length, 'every store is offered, not only the unticked').toBe(STORE_CFG.length)
    expect(items.find(b => b.dataset.cfg === 'nav')!.classList.contains('on')).toBe(true)
    expect(items.find(b => b.dataset.cfg === 'cl')!.classList.contains('on')).toBe(false)
  })

  it('clicking a lit row in the popup takes that store OFF the jet', async () => {
    const { DAYS } = await import('../engine/data')
    await click(editTab())
    const add = $('#eWeek .stcfg[data-stcfg]')
    const [di, gi, li, ai] = add.dataset.stcfg!.split('.')
    const a = DAYS[+di!].waves[+gi!].formations[+li!].aircraft[+ai!]; a.opts = a.opts || {}
    a.opts.nav = true; await act(async () => notify())
    await click($(`#eWeek .stcfg[data-stcfg="${di}.${gi}.${li}.${ai}"]`))
    await click(document.querySelector('.stmenu [data-cfg="nav"]') as HTMLElement)
    expect(a.opts.nav).toBe(false)
  })
})

describe('text edits carry amendment marks (area/atime commit + AL colouring)', () => {
  it('typing in the AREA cell commits on focusout and marks ar: pending', async () => {
    const { DAYS } = await import('../engine/data')
    const { SCHED } = await import('../engine/publish')
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
    const ar = document.querySelector('#eWeek .areacell[data-area]') as HTMLElement
    expect(ar, 'an area cell renders on the edit week').toBeTruthy()
    const [di, gi, li] = ar.dataset.area!.split('.')
    const f = DAYS[+di!].waves[+gi!].formations[+li!]
    const was = f.area
    ar.textContent = 'D99X'
    await act(async () => { ar.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
    await act(async () => { await new Promise(r => setTimeout(r, 5)) })
    expect(f.area).toBe('D99X')
    expect(SCHED.pending[`ar:${di}.${gi}.${li}`]).toBeTruthy()
    f.area = was; delete SCHED.pending[`ar:${di}.${gi}.${li}`]
    await act(async () => { const { afterSchedMutate } = await import('../state/view'); const { notify } = await import('../state/store'); afterSchedMutate(); notify() })
  })

  it('typing in the AREA TIME cell commits on focusout and marks at: pending', async () => {
    const { DAYS } = await import('../engine/data')
    const { SCHED } = await import('../engine/publish')
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
    const at = document.querySelector('#eWeek .timecell[data-atime]') as HTMLElement
    expect(at, 'an area-time cell renders on the edit week').toBeTruthy()
    const [di, gi, li] = at.dataset.atime!.split('.')
    const f = DAYS[+di!].waves[+gi!].formations[+li!]
    const was = f.atime
    at.textContent = '0900-1000'
    await act(async () => { at.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
    await act(async () => { await new Promise(r => setTimeout(r, 5)) })
    expect(f.atime).toBe('0900-1000')
    expect(SCHED.pending[`at:${di}.${gi}.${li}`]).toBeTruthy()
    f.atime = was; delete SCHED.pending[`at:${di}.${gi}.${li}`]
    await act(async () => { const { afterSchedMutate } = await import('../state/view'); const { notify } = await import('../state/store'); afterSchedMutate(); notify() })
  })

  /* THE OTHER DIRECTION, which is what actually shipped broken (owner spotted
     it on screen, 6 Aug 26). AREA and AREA TIME are the only cells whose
     displayed value is DERIVED, so the model field is null while the cell
     already reads "D1415 · AA2NS" / "1240-1405". The commit compared the text
     to '' and therefore called every focusout a change: clicking in and
     straight back out, or tabbing through, stored the derived value as a typed
     one. The dashed "edited" hint is what gets noticed; the damage is that the
     stored value WINS over the derivation, so the airspace window then stops
     following the take-off. */
  it('touching AREA / AREA TIME without typing commits nothing', async () => {
    const { DAYS } = await import('../engine/data')
    const { SCHED } = await import('../engine/publish')
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
    for (const [sel, attr, field] of [
      ['#eWeek .areacell[data-area]', 'area', 'area'],
      ['#eWeek .timecell[data-atime]', 'atime', 'atime'],
    ] as const) {
      const el = document.querySelector(sel) as HTMLElement
      const [di, gi, li] = (el.dataset as any)[attr].split('.')
      const f = DAYS[+di!].waves[+gi!].formations[+li!]
      expect(f[field], `${field} starts derived, not stored`).toBeUndefined()
      const shown = el.textContent
      expect(shown, 'and the cell is showing that derivation').toBeTruthy()
      /* focusout with the text exactly as rendered — a stray click, a tab */
      await act(async () => { el.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
      await act(async () => { await new Promise(r => setTimeout(r, 5)) })
      expect(f[field], `${field} is still derived`).toBeUndefined()
      expect(SCHED.pending[`${attr === 'area' ? 'ar' : 'at'}:${di}.${gi}.${li}`],
        'and nothing is queued for the next amendment').toBeFalsy()
    }
  })

  it('so the airspace window keeps following the take-off after a stray click', async () => {
    const { DAYS } = await import('../engine/data')
    const { txtSet } = await import('../engine/slots')
    const { afterSchedMutate } = await import('../state/view')
    const { notify } = await import('../state/store')
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
    const at = document.querySelector('#eWeek .timecell[data-atime]') as HTMLElement
    const [di, gi, li] = at.dataset.atime!.split('.')
    const f = DAYS[+di!].waves[+gi!].formations[+li!]
    const wasTo = f.to
    /* touch it, type nothing */
    await act(async () => { at.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
    await act(async () => { await new Promise(r => setTimeout(r, 5)) })
    /* now move the take-off; the strip has to move with it */
    await act(async () => { txtSet(`ff:${di}.${gi}.${li}.to`, '08:00'); afterSchedMutate(); notify() })
    await act(async () => { await new Promise(r => setTimeout(r, 10)) })
    const now = document.querySelector('#eWeek .timecell[data-atime]') as HTMLElement
    expect(now.textContent, 'the window tracks the new take-off').toBe(`0800-${f.ld.replace(':', '')}`)
    await act(async () => { txtSet(`ff:${di}.${gi}.${li}.to`, wasTo); afterSchedMutate(); notify() })
  })

  it('but clearing the cell still stores the blank, rather than reverting', async () => {
    const { DAYS } = await import('../engine/data')
    const { SCHED } = await import('../engine/publish')
    const { afterSchedMutate } = await import('../state/view')
    const { notify } = await import('../state/store')
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
    const at = document.querySelector('#eWeek .timecell[data-atime]') as HTMLElement
    const [di, gi, li] = at.dataset.atime!.split('.')
    const f = DAYS[+di!].waves[+gi!].formations[+li!]
    at.textContent = ''
    await act(async () => { at.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
    await act(async () => { await new Promise(r => setTimeout(r, 5)) })
    expect(f.atime, 'an emptied cell is a decision, and it sticks').toBe('')
    delete f.atime; delete SCHED.pending[`at:${di}.${gi}.${li}`]
    await act(async () => { afterSchedMutate(); notify() })
  })

  it('an edited remark shows the pending mark, then its AL colour once published', async () => {
    const { SCHED, alIssue, unpublishAL } = await import('../engine/publish')
    const { txtGet, txtSet } = await import('../engine/slots')
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
    const tx = document.querySelector('#eWeek [data-txt^="fr:"]') as HTMLElement
    expect(tx, 'a remark span renders on the edit week').toBeTruthy()
    const key = tx.dataset.txt!, was = txtGet(key)
    tx.textContent = 'AL MARK TEST'
    await act(async () => { tx.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
    await act(async () => { await new Promise(r => setTimeout(r, 5)) })
    expect(SCHED.pending[key]).toBeTruthy()
    let el = document.querySelector(`#eWeek [data-txt="${key}"]`) as HTMLElement
    expect(el.hasAttribute('data-alp'), 'pending mark rendered on the text').toBe(true)
    await act(async () => { alIssue(8, [key]); const { notify } = await import('../state/store'); notify() })
    el = document.querySelector(`#eWeek [data-txt="${key}"]`) as HTMLElement
    expect(el.getAttribute('data-alc'), 'AL colour rendered on the text').toBe('8')
    /* and the read-only view carries the same mark */
    await click($$('.nav a[data-page]').find(x => x.dataset.page === 'viewsched')!)
    const vw = [...document.querySelectorAll('#vWeek [data-alc="8"]')].find(x => x.textContent!.includes('AL MARK TEST'))
    expect(vw, 'the view week shows the AL-coloured text').toBeTruthy()
    await act(async () => { unpublishAL(8); txtSet(key, was); delete SCHED.pending[key]; const { notify } = await import('../state/store'); notify() })
  })
})

describe('the nudge buttons move a row one place as rendered', () => {
  it('▼ on the first programme item swaps it with the second', () => {
    const di = DAYS.findIndex((d: any) => (d.allhands || []).length > 1)
    const was = DAYS[di].allhands.map((x: any) => x.prog)
    mountBoard(di)
    clickAttr(`[data-mvdn="mv:p.${di}.0"]`)
    expect(DAYS[di].allhands.map((x: any) => x.prog)).toEqual([was[1], was[0], ...was.slice(2)])
  })

  it('▲ on the first row is a no-op rather than an error', () => {
    const di = DAYS.findIndex((d: any) => (d.allhands || []).length > 1)
    const was = JSON.stringify(DAYS[di].allhands)
    mountBoard(di)
    clickAttr(`[data-mvup="mv:p.${di}.0"]`)
    expect(JSON.stringify(DAYS[di].allhands)).toBe(was)
  })

  /* the ground list renders time-sorted, so "one place down/up" is a question
     about the DOM, not about model indices — and a nudge test on a sorted
     list only PROVES that if it picks a row whose on-screen neighbour is NOT
     also its numeric neighbour. With this fixture (C=model0/1000, A=model1/
     0800, B=model2/0900) the render order is A, B, C. Nudging A (model 1)
     down targets B (model 2) — and index+1 from 1 is ALSO 2, so a naive
     index±1 implementation lands on the same answer by coincidence and the
     test would pass either way, proving nothing. C is the row that exposes
     it: rendered LAST (position 2) but stored at model index 0, so its
     on-screen neighbour above is B (model 2) while index-1 from 0 is -1 — the
     two implementations now disagree, and only the correct one can pass. */
  it('▲ on a ground row moves it past the row rendered above it, even though its model index is 0', () => {
    DAYS[0].ground = [
      { prog: 'C', str: '1000' }, { prog: 'A', str: '0800' }, { prog: 'B', str: '0900' },
    ]
    /* the panel is only ever repainted by a notify() (SchedBoard's own
       version-diffed effect) — a raw fixture assignment above bypasses the
       mutation funnel entirely, so without this the board would still be
       showing whatever ground rows an earlier test in this block left it on */
    act(() => notify())
    mountBoard(0)
    clickAttr('[data-mvup="mv:g.0.0"]')     // model 0 is 'C', rendered last
    expect(DAYS[0].gman).toBe(true)
    expect(DAYS[0].ground.map((r: any) => r.prog)).toEqual(['A', 'C', 'B'])
  })

  it('a member cannot nudge', () => {
    setSession({ user: 'user', role: 'member' } as any)
    const di = DAYS.findIndex((d: any) => (d.allhands || []).length > 1)
    const was = JSON.stringify(DAYS[di].allhands)
    mountBoard(di)
    clickAttr(`[data-mvdn="mv:p.${di}.0"]`)
    expect(JSON.stringify(DAYS[di].allhands)).toBe(was)
  })
})

describe('the Auto sort buttons put a section back in order', () => {
  /* capture toasts without repainting anything, same idiom as drag.test.tsx */
  let toasts: string[] = []
  beforeAll(() => { setSession({ user: 'a', role: 'admin' }); HOOKS.toast = (m: any) => { toasts.push(String(m)) } })

  it('sorts the Overall programme by start time', () => {
    const di = DAYS.findIndex((d: any) => (d.allhands || []).length > 1)
    DAYS[di].allhands = [{ prog: 'LATER', str: '1500' }, { prog: 'EARLIER', str: '0800' }]
    act(() => notify())
    mountBoard(di)
    clickAttr(`[data-sortsec="p.${di}"]`)
    expect(DAYS[di].allhands.map((x: any) => x.prog)).toEqual(['EARLIER', 'LATER'])
  })

  it('toasts "Already in order" and changes nothing when the section is already sorted', () => {
    const di = DAYS.findIndex((d: any) => (d.allhands || []).length > 1)
    DAYS[di].allhands = [{ prog: 'EARLIER', str: '0800' }, { prog: 'LATER', str: '1500' }]
    act(() => notify())
    mountBoard(di)
    toasts = []
    clickAttr(`[data-sortsec="p.${di}"]`)
    expect(DAYS[di].allhands.map((x: any) => x.prog)).toEqual(['EARLIER', 'LATER'])
    expect(toasts).toContain('Already in order')
  })

  it('sorts a duty block by role, SDO above SXO above OPS-O', () => {
    DAYS[0].dutywaves[0].rows = [{ role: 'OPS-O', id: 'y' }, { role: 'SDO', id: 'x' }]
    act(() => notify())
    mountBoard(0)
    clickAttr('[data-sortsec="d.0.0"]')
    expect(DAYS[0].dutywaves[0].rows.map((r: any) => r.role)).toEqual(['SDO', 'OPS-O'])
  })

  it('sorts Ground by start time and clears gman, so the day resumes sorting itself', () => {
    DAYS[0].ground = [{ prog: 'LATER', str: '1500' }, { prog: 'EARLIER', str: '0800' }]
    DAYS[0].gman = true
    act(() => notify())
    mountBoard(0)
    clickAttr('[data-sortsec="g.0"]')
    expect(DAYS[0].ground.map((x: any) => x.prog)).toEqual(['EARLIER', 'LATER'])
    expect(DAYS[0].gman).toBeFalsy()
  })

  /* review round 1: gman set, but the rows it was frozen into already read
     in time order — sortGround reports true (the day DID un-freeze) and
     the UI must say so, not the generic "Already in order" a pure identity
     check would otherwise show for a click that changed nothing visible. */
  it('tells the truth when Ground was manually frozen but already read in time order: something changed, and it says so', () => {
    DAYS[0].ground = [{ prog: 'EARLIER', str: '0800' }, { prog: 'LATER', str: '1500' }]
    DAYS[0].gman = true
    act(() => notify())
    mountBoard(0)
    toasts = []
    clickAttr('[data-sortsec="g.0"]')
    expect(DAYS[0].ground.map((x: any) => x.prog)).toEqual(['EARLIER', 'LATER'])
    expect(DAYS[0].gman).toBeFalsy()
    expect(toasts).not.toContain('Already in order')
    expect(toasts).toContain('Ground programme back to time order')
  })

  it('sorts a flying wave by take-off time, without touching the jets inside a formation', () => {
    const w = DAYS[0].waves[0]
    w.formations = [
      { cs: 'LATE', msn: 'BFM', to: '1400', ld: '1500', aircraft: [{ p: 'stiff', w: 'freak' }] },
      { cs: 'EARLY', msn: 'BFM', to: '0800', ld: '0900', aircraft: [{ p: 'bane', w: 'wolf' }] },
    ]
    act(() => notify())
    mountBoard(0)
    clickAttr('[data-sortsec="w.0.0"]')
    expect(w.formations.map((f: any) => f.cs)).toEqual(['EARLY', 'LATE'])
  })

  it('a member sees no Auto sort control', () => {
    setSession({ user: 'user', role: 'member' } as any)
    act(() => notify())   // canEditSched() flipped — repaint so mvRO takes hold, not stale admin markup
    const di = DAYS.findIndex((d: any) => (d.allhands || []).length > 1)
    mountBoard(di)
    expect($(`[data-sortsec="p.${di}"]`)).toBeFalsy()
  })
})

describe('Sort all — every section, one confirm, one undo step (owner, 8 Aug 26)', () => {
  /* capture toasts without repainting anything, same idiom as the Auto sort
     block above */
  let toasts: string[] = []
  beforeAll(() => { setSession({ user: 'a', role: 'admin' }); HOOKS.toast = (m: any) => { toasts.push(String(m)) } })

  /* whole-day fixture with exactly one collection per section so nothing
     left over from the seed data can quietly sneak an extra reorder in —
     every section that HAS more than one row is shuffled out of order here,
     and nothing else in the day is left ambiguous. */
  const shuffle = (di: number) => {
    DAYS[di].notes = ['SECOND TYPED', 'FIRST TYPED']   // no sorter reads notes — must survive untouched
    DAYS[di].allhands = [{ prog: 'LATER', str: '1500', end: '' }, { prog: 'EARLIER', str: '0800', end: '' }]
    DAYS[di].waves = [{
      label: 'WAVE 1', night: false, intimes: [], traffic: [], formations: [
        { cs: 'LATE', msn: 'BFM', to: '1400', ld: '1500', aircraft: [{ p: 'stiff', w: 'freak' }] },
        { cs: 'EARLY', msn: 'BFM', to: '0800', ld: '0900', aircraft: [{ p: 'bane', w: 'wolf' }] },
      ],
    }]
    DAYS[di].dutywaves = [{
      label: '1st wave', rows: [
        { role: 'OPS-O', id: 'y', str: '0600', end: '1400' },
        { role: 'SDO', id: 'x', str: '0700', end: '1300' },
      ],
    }]
    DAYS[di].sims = {
      oft: [
        { label: 'LATE', str: '1500', end: '1630', p: 'a' },
        { label: 'EARLY', str: '0800', end: '0930', p: 'b' },
      ],
    }
    DAYS[di].ground = [{ prog: 'LATER', str: '1500', end: '' }, { prog: 'EARLIER', str: '0800', end: '' }]
    DAYS[di].gman = false
  }
  /* the same day, already in each section's own order — a single row per
     collection makes "already sorted" unambiguous rather than relying on
     careful multi-row ordering */
  const tidy = (di: number) => {
    DAYS[di].notes = ['ONLY NOTE']
    DAYS[di].allhands = [{ prog: 'ONE', str: '0800', end: '' }]
    DAYS[di].waves = [{
      label: 'WAVE 1', night: false, intimes: [], traffic: [], formations: [
        { cs: 'ONE', msn: 'BFM', to: '0800', ld: '0900', aircraft: [{ p: 'bane', w: 'wolf' }] },
      ],
    }]
    DAYS[di].dutywaves = [{ label: '1st wave', rows: [{ role: 'SDO', id: 'x', str: '0700', end: '1300' }] }]
    DAYS[di].sims = { oft: [{ label: 'ONE', str: '0800', end: '0930', p: 'b' }] }
    DAYS[di].ground = [{ prog: 'ONE', str: '0800', end: '' }]
    DAYS[di].gman = false
  }
  const runSortAll = (di: number) => {
    mountBoard(di)
    clickAttr('#sbSortAll')
    clickAttr('#sortAllConfirm')
  }

  it('orders every section at once and leaves notes in their typed order', () => {
    const di = 0
    shuffle(di)
    act(() => notify())
    runSortAll(di)
    expect(DAYS[di].allhands.map((x: any) => x.prog)).toEqual(['EARLIER', 'LATER'])
    expect(DAYS[di].dutywaves[0].rows.map((r: any) => r.role)).toEqual(['SDO', 'OPS-O'])
    expect(DAYS[di].sims.oft.map((x: any) => x.label)).toEqual(['EARLY', 'LATE'])
    expect(DAYS[di].ground.map((x: any) => x.prog)).toEqual(['EARLIER', 'LATER'])
    expect(DAYS[di].waves[0].formations.map((f: any) => f.cs)).toEqual(['EARLY', 'LATE'])
    expect(DAYS[di].notes).toEqual(['SECOND TYPED', 'FIRST TYPED'])
  })

  /* the confirm is the whole point — every other board control acts the
     instant it's clicked, so this one alone must NOT: opening it must open
     the dialog and touch nothing, and the day only moves once the SECOND
     click (the dialog's own Sort all button) lands. */
  it('the button alone opens a confirm and changes nothing; only confirming runs it', () => {
    const di = 0
    shuffle(di)
    act(() => notify())
    const before = JSON.stringify(DAYS[di])
    mountBoard(di)
    clickAttr('#sbSortAll')
    expect(($('#sortAllPop') as HTMLElement).hidden).toBe(false)
    expect(JSON.stringify(DAYS[di])).toBe(before)
    clickAttr('#sortAllConfirm')
    expect(JSON.stringify(DAYS[di])).not.toBe(before)
  })

  /* the whole reason the lock exists: six sorters marking six keys must not
     leave six snapshots on the stack — capture the WHOLE day's JSON before
     Sort all runs, and after one undo it must be byte-identical to that,
     not merely "close" or "mostly restored". */
  it('is ONE undo step: a single undo restores the whole day, byte-identical to before', () => {
    const di = 0
    shuffle(di)
    /* the raw fixture assignment above bypasses the mutation funnel (same as
       every other fixture in this file), so nothing has put it on the undo
       stack yet — histPush() here stands in for the real edits (a drag, a
       text commit) that would have put it there in actual use, so "before"
       below names a snapshot Undo can actually land on, not a live object
       that was never recorded */
    act(() => { notify(); histPush() })
    const before = JSON.stringify(DAYS[di])
    const depth = HIST.stack.length
    runSortAll(di)
    // sanity: it actually changed something, or "one undo step" would prove nothing
    expect(DAYS[di].allhands.map((x: any) => x.prog)).toEqual(['EARLIER', 'LATER'])
    expect(HIST.stack.length - depth, 'one action, one undo step').toBe(1)
    act(() => undo())
    expect(JSON.stringify(DAYS[di])).toBe(before)
  })

  it('changes nothing and marks nothing on a day already in order, and says so', () => {
    const di = 0
    tidy(di)
    act(() => notify())
    const before = JSON.stringify(DAYS[di])
    SCHED.pending = {}
    toasts = []
    runSortAll(di)
    expect(JSON.stringify(DAYS[di])).toBe(before)
    expect(SCHED.pending).toEqual({})
    expect(toasts).toContain('Already in order')
  })

  it('a member cannot trigger it', () => {
    setSession({ user: 'user', role: 'member' } as any)
    act(() => notify())
    const di = 0
    mountBoard(di)
    expect($('#sbSortAll')).toBeFalsy()
  })
})
