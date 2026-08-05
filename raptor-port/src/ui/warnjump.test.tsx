// @vitest-environment jsdom
/* Jumping from a warning to the puck that caused it, on all four surfaces that
   flag aircrew: the week's issue rows, the day-detail panel, the board's issue
   list and the flag chip on a puck itself.

   jsdom has no layout and does not implement scrollIntoView (which is why
   highlights.ts wraps the call in a try/catch), so the scroll is pinned by
   stubbing it and asserting WHICH element it fired on — that is the only way
   to gate the target-picking rule without a browser. The geometry of the
   scroll itself belongs to e2e/geometry.spec.ts. */
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { validate, WARN } from '../engine/validate'
import { personWarns } from '../engine/avail'
import * as view from '../state/view'
import { openScheduler } from './board'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

/* the scroll spy: records the element scrollIntoView was called ON, so a test
   can assert the destination and not merely that something moved */
const scrolled: Element[] = []

/* the focus scroll is deferred one macrotask (the week's effect swaps day
   boxes and restores scrollLeft first, so an earlier scroll would be clobbered) */
const flush = async () => { await act(async () => { await new Promise(r => setTimeout(r, 0)) }) }

beforeAll(async () => {
  ;(Element.prototype as any).scrollIntoView = function (this: Element) { scrolled.push(this) }
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  validate()
})

beforeEach(async () => {
  scrolled.length = 0
  await act(async () => { view.selDrop(); notify() })
})

/* the first day carrying at least one warning — the seed week always has some,
   but pinning an index would break the moment the demo data is re-tuned */
const warnDay = () => WARN.byDay.findIndex((g: any) => g && g.warns && g.warns.length)

describe('the board issue list is a navigation surface', () => {
  it('every .wln carries the index of the warning it renders', async () => {
    const di = warnDay()
    await act(async () => { openScheduler(di); notify() })
    const rows = $$('#sbWarn .wln[data-wix]')
    expect(rows.length, 'the board lists the day\'s issues').toBe(WARN.byDay[di].warns.length)
    /* the regression this pins: boardWarnHTML used to sort its own copy, so an
       index taken from the rendered order would address the wrong warning */
    rows.forEach(r => {
      const w = WARN.byDay[+r.dataset.wdi!].warns[+r.dataset.wix!]
      expect(w, 'the index resolves').toBeTruthy()
      expect(r.textContent).toContain(w.msg)
    })
  })

  it('the "no conflicts" line is not addressable', async () => {
    const clean = WARN.byDay.findIndex((g: any) => !g || !g.warns || !g.warns.length)
    expect(clean, 'the seed week has a clean day to test with').toBeGreaterThan(-1)
    await act(async () => { openScheduler(clean); notify() })
    expect($('#sbWarn .wln.ok')).toBeTruthy()
    expect($$('#sbWarn .wln[data-wdi]').length).toBe(0)
  })

  it('clicking one focuses it, opens the day box behind the board, and scrolls', async () => {
    const di = warnDay()
    await act(async () => { openScheduler(di); notify() })
    await click($('#sbWarn .wln[data-wix]'))
    await flush()
    expect(view.WFOCUS, 'the warning is focused').toBeTruthy()
    expect(view.WFOCUS.di).toBe(di)
    expect($$('#sbWarn .wln.on').length, 'the row shows as selected').toBe(1)
    /* the dead-end this pins: focusWarn never touches DWOPEN, so a focus set
       from the board would leave lit pucks with no "Clear focus" button once
       the board is closed */
    expect(view.DWOPEN.has(di), 'the day box opened behind the board').toBe(true)
    expect(scrolled.length, 'it scrolled').toBeGreaterThan(0)
  })

  it('it scrolls to a board puck, never into the roster palette', async () => {
    const di = warnDay()
    await act(async () => { openScheduler(di); notify() })
    await click($('#sbWarn .wln[data-wix]'))
    await flush()
    const tgt = scrolled[scrolled.length - 1]
    /* #sbRoster also holds real .puck[data-person] — built for paletteDay(),
       not SBDAY — so scoping the search to #schedBoard would land there */
    expect(tgt.closest('.sb-boardwrap'), 'the target is in the board, not the side panel').toBeTruthy()
    expect(tgt.closest('#sbRoster')).toBeFalsy()
  })

  it('board pucks light under the focus, and the palette does not', async () => {
    const di = warnDay()
    await act(async () => { openScheduler(di); notify() })
    await click($('#sbWarn .wln[data-wix]'))
    await flush()
    expect($$('.sb-boardwrap .puck.wfoc').length).toBeGreaterThan(0)
    expect($$('#sbRoster .puck.wfoc').length, 'the palette keeps its normal look').toBe(0)
  })
})

describe('the flag chip on a puck', () => {
  it('jumps to that person\'s worst issue on the day', async () => {
    await act(async () => { view.setBoardDay(null); notify() })
    const chip = $('#vWeek .day[data-day] .puck[data-person] .lchip')
    expect(chip, 'the seed week renders at least one flag chip').toBeTruthy()
    const pk = chip.closest('.puck[data-person]') as HTMLElement
    const di = +(pk.closest('.day[data-day]') as HTMLElement).dataset.day!
    const want = personWarns(di, pk.dataset.person)[0]
    await click(chip)
    await flush()
    expect(view.WFOCUS, 'a warning is focused').toBeTruthy()
    /* personWarns preserves WARN's order, which validate() sorted by severity,
       so [0] is the worst — no comparator, and no way to get here from chipOf,
       which collapses by RANK and is not invertible */
    expect(view.WFOCUS.ix).toBe(want.ix)
    expect(view.DWOPEN.has(di)).toBe(true)
    expect(scrolled.length).toBeGreaterThan(0)
  })

  it('a CP chip reaches the crew-pairing warning it stands for', async () => {
    /* This is the gap CP (renamed from CC, owner ask 5 Aug 26) was added to
       close: the pairing rules used to ring the puck and caption nothing, so
       they were the one warning family with nothing on the puck to click. */
    await act(async () => { view.setBoardDay(null); view.selDrop(); notify() })
    const cp = $$('#vWeek .puck[data-person] .lchip')
      .find(c => (c.textContent || '').trim() === 'CP')
    expect(cp, 'the seed week renders a CP chip').toBeTruthy()
    const pk = cp!.closest('.puck[data-person]') as HTMLElement
    const di = +(pk.closest('.day[data-day]') as HTMLElement).dataset.day!
    await click(cp!)
    await flush()
    expect(view.WFOCUS, 'a warning is focused').toBeTruthy()
    const w = WARN.byDay[view.WFOCUS.di].warns[view.WFOCUS.ix]
    expect(['CREW_SOLO', 'CO_APPROVAL', 'OCU_NO_IP', 'ILLEGAL_CREW', 'NO_IR'])
      .toContain(w.code)
    expect(w.who).toContain(pk.dataset.person)
    expect(view.DWOPEN.has(di)).toBe(true)
    expect(scrolled.length).toBeGreaterThan(0)
  })

  it('both CP codes print the same two letters, so the squadron reads one flag', () => {
    const txt = $$('#vWeek .puck .lchip').map(c => (c.textContent || '').trim())
    expect(txt).toContain('CP')
    /* CPH must never reach the screen as its own glyph — it is CP in red */
    expect(txt).not.toContain('CPH')
  })

  it('the puck body still selects the person', async () => {
    const pk = $('#vWeek .puck[data-person]')
    await click(pk.querySelector('.nm'))
    expect(view.SELID, 'clicking the name selects, it does not focus a warning').toBeTruthy()
  })
})

describe('the target puck', () => {
  it('a two-person warning lands on the row holding both of them', async () => {
    /* the crew-combination family (ILLEGAL_CREW, CREW_SOLO, CO_APPROVAL, NO_IR)
       names the pilot AND the WSO of ONE aircraft — the aircraft row is the
       place the scheduler has to look, not whichever name sorts first */
    let di = -1, ix = -1
    WARN.byDay.forEach((g: any, d: number) => {
      if (di >= 0 || !g || !g.warns) return
      const k = g.warns.findIndex((w: any) => (w.who || []).length >= 2)
      if (k >= 0) { di = d; ix = k }
    })
    expect(di, 'the seed week has a multi-person warning').toBeGreaterThan(-1)
    await act(async () => { view.setBoardDay(null); view.toggleDayWarn(di); notify() })
    const row = $(`#vWeek .day[data-day="${di}"] .witem[data-wix="${ix}"]`)
    expect(row, 'its row is on screen').toBeTruthy()
    await click(row)
    await flush()
    const tgt = scrolled[scrolled.length - 1] as HTMLElement
    const ids = WARN.byDay[di].warns[ix].who
    const holder = tgt.closest('.acrow') || tgt.parentElement
    const inRow = new Set([...holder!.querySelectorAll('.puck[data-person]')]
      .map((x: any) => x.dataset.person).filter((p: any) => ids.includes(p)))
    expect(inRow.size, 'the destination row holds both of the named crew').toBeGreaterThan(1)
  })
})

describe('a stale warning row', () => {
  it('does not fly the week off to the previously focused warning', async () => {
    const di = warnDay()
    await act(async () => { view.setBoardDay(null); view.toggleDayWarn(di); notify() })
    await click($(`#vWeek .day[data-day="${di}"] .witem[data-wdi]`))
    await flush()
    expect(view.WFOCUS, 'something is focused to begin with').toBeTruthy()
    const was = { di: view.WFOCUS.di, ix: view.WFOCUS.ix }

    /* WARN is reassigned wholesale by every validate(), so a row rendered
       before an edit can outlive the warning it addresses. Simulate exactly
       that: keep the DOM, drop the warning underneath it. */
    const row = $$(`#vWeek .day[data-day="${di}"] .witem[data-wdi]`).pop()!
    row.dataset.wix = String(WARN.byDay[di].warns.length + 5)
    scrolled.length = 0
    await click(row)
    await flush()
    expect(scrolled.length, 'a stale click scrolls nowhere at all').toBe(0)
    expect(view.WFOCUS.di, 'and leaves the live focus alone').toBe(was.di)
    expect(view.WFOCUS.ix).toBe(was.ix)
  })
})

/* ---- the board day tab clears a stale warning focus (owner, 5 Aug 26) -----
   setBoardDay disarms a cross-day armed slot but used to leave WFOCUS pointed
   at the day just left. warnOnBoard() (WFOCUS.di===SBDAY) then goes false and
   highlights.ts stops lighting anything — the lit pucks and the selected
   issue row vanish while the app still holds a focus nothing on screen can
   clear. Three paths, three assertions below: the open-board path (SBDAY
   null -> n) must leave a week focus alone; switching the board day tab AWAY
   from the focused day must drop it; switching the tab TO the focused day
   must keep it. */
describe('the board day tab clears a stale warning focus', () => {
  it('open leaves it, switching away drops it, switching back keeps it', async () => {
    const di = warnDay()
    const other = di === 0 ? 1 : 0

    /* focus a warning from the WEEK, board still closed */
    await act(async () => { view.setBoardDay(null); view.toggleDayWarn(di); notify() })
    await click($(`#vWeek .day[data-day="${di}"] .witem[data-wdi]`))
    await flush()
    expect(view.WFOCUS, 'a warning is focused from the week').toBeTruthy()
    expect(view.WFOCUS.di).toBe(di)

    /* opening the board on a DIFFERENT day is the null->n path — untouched */
    await act(async () => { openScheduler(other); notify() })
    expect(view.WFOCUS, 'opening the board on another day leaves a week focus alone').toBeTruthy()
    expect(view.WFOCUS.di).toBe(di)

    /* the real day-tab click (not a direct setBoardDay call), switching the
       board TO the focused warning's own day — must keep it */
    await click($(`#sbDays [data-sbtab="${di}"]`))
    expect(view.WFOCUS, 'switching the board day tab onto the focused day keeps it').toBeTruthy()
    expect(view.WFOCUS.di).toBe(di)

    /* and switching the tab AWAY from that day clears the now-stale focus */
    await click($(`#sbDays [data-sbtab="${other}"]`))
    expect(view.WFOCUS, 'switching the board day tab off the focused day clears it').toBeNull()
  })
})

/* ---- the Available-crew list is never the destination ---------------------
   Reported from the deployed site (owner, 5 Aug 26): clicking Casper's
   crew-rest warning on Tuesday panned to the AVAILABLE CREW block at the foot
   of the day instead of the flight that caused the breach.

   Two things conspired. The target rule's co-location guard tested how many
   PUCKS it had found rather than how many PEOPLE the warning names — and a
   one-person warning can never satisfy "an ancestor holding two of the named
   crew", so every candidate scored full depth-to-root and the shallowest
   nesting won. The Available-crew block is a flat grid, so it beats a puck
   nested inside a flying line every time.

   And it went unseen because that block renders on the EDIT week only
   (`if(ed)h+=availHTML(...)`), while every other test here drives the view
   week. These drive the edit surface for exactly that reason. */
describe('the Available-crew list is never the destination (edit week)', () => {
  beforeAll(async () => {
    await click($$('.nav a[data-page]').find(a => (a as HTMLElement).dataset.page === 'editsched')!)
  })

  it('the edit week really is rendering the free-crew block', () => {
    /* if this ever stops being true the two tests below go quietly vacuous */
    expect($$('#eWeek .availpuck .puck[data-person]').length).toBeGreaterThan(0)
  })

  it('a one-person warning lands on a tasking, not on the free-crew grid', async () => {
    let hit: any = null
    WARN.byDay.forEach((g: any, di: number) => {
      if (hit || !g || !g.warns) return
      g.warns.forEach((w: any, ix: number) => {
        if (hit || (w.who || []).length !== 1) return
        const day = $(`#eWeek .day[data-day="${di}"]`)
        if (!day) return
        const pucks = [...day.querySelectorAll(`.puck[data-person="${w.who[0]}"]`)]
        /* the shape that triggers it: ONE named person, on screen more than
           once, at least one of those in the Available-crew block */
        if (pucks.length > 1 && pucks.some(p => p.closest('.availpuck'))) hit = { di, ix, w }
      })
    })
    expect(hit, 'the seed week flags someone who also shows as free').toBeTruthy()
    await act(async () => { view.selDrop(); view.toggleDayWarn(hit.di); notify() })
    const row = $(`#eWeek .day[data-day="${hit.di}"] .witem[data-wix="${hit.ix}"]`)
    expect(row, 'its issue row is on screen').toBeTruthy()
    scrolled.length = 0
    await click(row)
    await flush()
    const tgt = scrolled[scrolled.length - 1] as HTMLElement
    expect(tgt, 'it scrolled somewhere').toBeTruthy()
    expect(tgt.closest('.availpuck'),
      `${hit.w.who[0]}'s ${hit.w.code} must not land in AVAILABLE CREW`).toBeFalsy()
    expect(tgt.dataset.person, 'and it is still one of the named crew').toBe(hit.w.who[0])
  })

  it('no warning on any day targets the free-crew grid', async () => {
    /* the general form, so this cannot come back through a different code */
    for (let di = 0; di < WARN.byDay.length; di++) {
      const g = WARN.byDay[di]
      if (!g || !g.warns || !g.warns.length) continue
      await act(async () => { view.selDrop(); view.toggleDayWarn(di); notify() })
      for (const r of $$(`#eWeek .day[data-day="${di}"] .witem[data-wdi]`)) {
        scrolled.length = 0
        await click(r)
        await flush()
        const tgt = scrolled[scrolled.length - 1] as HTMLElement | undefined
        if (tgt) expect(tgt.closest('.availpuck'),
          `day ${di} warning ${r.dataset.wix} landed in AVAILABLE CREW`).toBeFalsy()
      }
      await act(async () => { view.selDrop(); notify() })
    }
  })
})
