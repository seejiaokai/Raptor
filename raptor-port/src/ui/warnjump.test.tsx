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
import { personWarns, personWarnDays } from '../engine/avail'
import { PEOPLE } from '../engine/people'
import * as view from '../state/view'
import { openScheduler } from './board'
import { anchorEl } from './highlights'

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

/* THE CHIP IS THE PUCK (owner, 7 Aug 26). It used to jump to the person's
   worst warning — one view from the chip, another from the puck body around
   it, on a target a few pixels wide. Now every click anywhere on a puck gives
   the PERSON view: selected blue, his flagged days' boxes open narrowed to
   him. The warning the chip used to jump to is in that box, alongside the
   rest of his. */
describe('the flag chip on a puck', () => {
  it('does exactly what the puck body does — selects the person', async () => {
    await act(async () => { view.setBoardDay(null); notify() })
    /* not a trace chip: the previous-day story is covered on its own below */
    const chip = $('#vWeek .day[data-day] .puck[data-person] .lchip:not([title*="is broken by"])')
    expect(chip, 'the seed week renders at least one flag chip').toBeTruthy()
    const pk = chip.closest('.puck[data-person]') as HTMLElement
    const id = pk.dataset.person!
    await click(chip)
    await flush()
    expect(view.SELID, 'the chip selects').toBe(id)
    expect(view.WFOCUS, 'and focuses no single warning').toBeNull()
    expect(view.PFOCUS && view.PFOCUS.id, 'the boxes are narrowed to him').toBe(id)
    personWarnDays(id).forEach((di: any) =>
      expect(view.DWOPEN.has(di), 'every day he is flagged on opens').toBe(true))
    const who = $('#vWeek .dwbox.pfoc .dwwho')
    expect(who && who.textContent, 'the box header names him').toBe(PEOPLE[id].cs)
  })

  it('a CP chip shows the crew-pairing warning with BOTH names', async () => {
    /* the pairing warning names pilot AND WSO; the person view must not lose
       the other man — "if it concerns a few people in that puck, it will show
       them too" (owner, 7 Aug 26). personWarns filters by membership, and the
       row prints the full who list, so his box carries both callsigns. */
    await act(async () => { view.setBoardDay(null); view.selDrop(); notify() })
    const cp = $$('#vWeek .puck[data-person] .lchip')
      .find(c => (c.textContent || '').trim() === 'CP')
    expect(cp, 'the seed week renders a CP chip').toBeTruthy()
    const pk = cp!.closest('.puck[data-person]') as HTMLElement
    const di = +(pk.closest('.day[data-day]') as HTMLElement).dataset.day!
    const id = pk.dataset.person!
    await click(cp!)
    await flush()
    expect(view.SELID).toBe(id)
    const pair = personWarns(di, id).find((x: any) =>
      ['CREW_SOLO', 'CO_APPROVAL', 'OCU_NO_IP', 'ILLEGAL_CREW', 'NO_IR'].includes(x.w.code))
    expect(pair, 'his person view holds the pairing warning').toBeTruthy()
    /* re-query the day: the week swaps day HTML via innerHTML, so the node
       pk was found in is detached the moment the click re-renders */
    const dayEl = $(`#vWeek .day[data-day="${di}"]`)
    const rows = Array.from(dayEl.querySelectorAll('.dwlist .witem')).map(r => r.textContent || '')
    const others = (pair!.w.who as string[]).filter((w: string) => w !== id)
    expect(others.length, 'the pairing really names more than him').toBeGreaterThan(0)
    others.forEach(o =>
      expect(rows.some(r => r.includes(PEOPLE[o].cs)), `the row still names ${PEOPLE[o].cs}`).toBe(true))
  })

  it('both CP codes print the same two letters, so the squadron reads one flag', () => {
    const txt = $$('#vWeek .puck .lchip').map(c => (c.textContent || '').trim())
    expect(txt).toContain('CP')
    /* CPH must never reach the screen as its own glyph — it is CP in red */
    expect(txt).not.toContain('CPH')
  })

  it('the puck body selects the person — now the definition, not the contrast', async () => {
    const pk = $('#vWeek .puck[data-person]')
    await click(pk.querySelector('.nm'))
    expect(view.SELID, 'clicking the name selects').toBeTruthy()
  })
})

/* THE PREVIOUS DAY, CLICKED (owner, 6 Aug 26; chip unified 7 Aug 26). A
   crew-rest breach is raised on the day the man is told to report, but it is
   marked on the day BEFORE — the day a scheduler can still change. The dotted
   puck now SELECTS like any other; what makes the cross-day story appear is
   that selecting him reveals the trace strip on the causing day, and its row
   is the affordance that leaves the day it was clicked on. */
describe('the previous day, clicked', () => {
  const traceChip = () => $$('#vWeek .puck[data-person] .lchip')
    .find(c => (c.getAttribute('title') || '').includes('is broken by'))

  it('the dotted puck\'s chip selects him and surfaces the cross-day strip', async () => {
    await act(async () => { view.setBoardDay(null); view.selDrop(); view.clearWarnFocus(); notify() })
    const chip = traceChip()
    expect(chip, 'the seed week traces one crew-rest breach back a day').toBeTruthy()
    const pk = chip!.closest('.puck[data-person]') as HTMLElement
    const dayEl = pk.closest('.day[data-day]') as HTMLElement
    const di = +dayEl.dataset.day!
    const id = pk.dataset.person!
    expect(pk.classList.contains('boxdot'), 'and rings it dotted').toBe(true)

    await click(chip!)
    await flush()
    expect(view.SELID, 'the chip selects the man').toBe(id)
    expect(view.WFOCUS, 'no single warning is focused').toBeNull()
    /* the breach day is in personWarnDays (CREW_REST names him there), so his
       selection opens tomorrow's box narrowed to him — the warning the chip
       used to jump to is on screen without the jump */
    expect(view.DWOPEN.has(di + 1), 'the day of the breach opens').toBe(true)
    /* and the causing day now shows the strip, revealed by the selection —
       its row is the navigation, pinned in the next test */
    const strip = document.querySelector(`#vWeek .day[data-day="${di}"] .dwtrace .witem[data-wdi]`) as HTMLElement
    expect(strip, 'the cross-day strip is revealed on the day clicked').toBeTruthy()
    expect(+strip.dataset.wdi!, 'addressed to the next day').toBe(di + 1)
  })

  it('the strip on the causing day\'s warning list reaches the same warning', async () => {
    /* the strip is on demand now (owner, 7 Aug 26), so ask for it: open every
       day's warning list and then look. Opening them all rather than guessing
       the causing day keeps this test indifferent to which seed day breaks
       which — the point here is the row's NAVIGATION, not where it appears. */
    await act(async () => {
      view.setBoardDay(null); view.selDrop(); view.clearWarnFocus()
      WARN.byDay.forEach((g: any) => { if (g) view.toggleDayWarn(g.di) })
      notify()
    })
    const row = $('#vWeek .dwtrace .witem[data-wdi]')
    expect(row, 'the causing day carries a cross-day row once its list is open').toBeTruthy()
    const di = +(row.closest('.day[data-day]') as HTMLElement).dataset.day!
    expect(+row.dataset.wdi!, 'addressed to the next day').toBe(di + 1)

    await click(row)
    await flush()
    expect(view.WFOCUS.di).toBe(di + 1)
    expect(WARN.byDay[view.WFOCUS.di].warns[view.WFOCUS.ix].code).toBe('CREW_REST')
    expect(scrolled.length).toBeGreaterThan(0)
  })

  /* ...AND LEAVES THE VIEW WHERE IT WAS CLICKED (owner, from the deployed site,
     7 Aug 26). The two halves are deliberately separate: the row still FOCUSES
     tomorrow's breach — the test above — but it PANS to the line on this day
     that caused it. Clicking used to throw the week over to the breach day and
     land on the flagged leg, which the row's own prose had already named; the
     sortie that ran late is the one a scheduler can still move, and nothing on
     the page pointed at it. */
  it('but pans to the causing day\'s own late line, not the breach day\'s puck', async () => {
    await act(async () => {
      view.setBoardDay(null); view.selDrop(); view.clearWarnFocus()
      WARN.byDay.forEach((g: any) => { if (g) view.toggleDayWarn(g.di) })
      notify()
    })
    const row = $('#vWeek .dwtrace .witem[data-wdi]')
    const di = +(row.closest('.day[data-day]') as HTMLElement).dataset.day!
    expect(+row.dataset.wpd!, 'the row addresses its own day for the pan').toBe(di)
    const key = row.dataset.wpk!
    expect(key, 'and names the leg the engine blamed').toBeTruthy()

    await click(row)
    await flush()
    const tgt = scrolled[scrolled.length - 1] as HTMLElement
    expect(tgt, 'something was scrolled to').toBeTruthy()
    const landedOn = +(tgt.closest('.day[data-day]') as HTMLElement).dataset.day!
    expect(landedOn, 'the view stayed on the day the row was read from').toBe(di)
    /* not merely the right day: the right LINE on it. anchorEl resolves the key
       to a seat, and the destination is the flagged man's puck in that seat's
       row — his first puck in document order would be the fallback, and on a
       day where he flies twice that is the wrong one. */
    const seat = anchorEl(tgt.closest('.day[data-day]'), key)
    expect(seat, 'the causing seat is on the page').toBeTruthy()
    const wantRow = seat!.closest('.acrow,.pl-row,.ah-row')
    expect(wantRow!.contains(tgt), 'and the pan landed inside its row').toBe(true)
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

/* ---- the anchored line wins ------------------------------------------------
   Warnings now carry the causing line's slot-key (validate.ts add()'s 5th
   argument — "the first item named in the message"), and warnTarget prefers
   the flagged person's puck INSIDE that line. The owner's cases, pinned:
   "no time for the flight brief" → the flight line, not the sim/duty row that
   ate the brief (or wherever the name happens to appear first in document
   order); "no time for the OFT brief" → the OFT row; a clash → the
   first-named item's line. These run on the EDIT week (the previous describe
   navigated there), which also renders the Available-crew grid — so they
   double as proof the anchor can never land there: the free-crew pucks carry
   no data-slot. */
describe('the anchored line wins', () => {
  /* find a warning of `code` whose row can be clicked on the edit week */
  const findWarn = (pred: (w: any) => boolean) => {
    let hit: any = null
    WARN.byDay.forEach((g: any, di: number) => {
      if (hit || !g || !g.warns) return
      g.warns.forEach((w: any, ix: number) => { if (!hit && pred(w)) hit = { di, ix, w } })
    })
    return hit
  }
  const jump = async (hit: any) => {
    await act(async () => { view.selDrop(); view.setBoardDay(null); view.toggleDayWarn(hit.di); notify() })
    const row = $(`#eWeek .day[data-day="${hit.di}"] .witem[data-wix="${hit.ix}"]`)
    expect(row, 'the issue row is on screen').toBeTruthy()
    scrolled.length = 0
    await click(row)
    await flush()
    return scrolled[scrolled.length - 1] as HTMLElement
  }
  /* the row containing the anchor key — segment-safe, same rule as anchorEl */
  const rowOf = (day: Element, key: string) =>
    [...day.querySelectorAll('[data-slot],[data-fill]')]
      .find((el: any) => { const k = el.dataset.slot || el.dataset.fill
        return k === key || (k && k.indexOf(key + '.') === 0) })
      ?.closest('.acrow,.pl-row,.ah-row')

  it('NO_BRIEF pans to the flagged person\'s seat in the FLIGHT line', async () => {
    const hit = findWarn((w: any) => w.code === 'NO_BRIEF')
    expect(hit, 'the seed week has a NO_BRIEF').toBeTruthy()
    const tgt = await jump(hit)
    expect(tgt, 'it scrolled somewhere').toBeTruthy()
    expect(tgt.dataset.person, 'the destination is the flagged person\'s puck').toBe(hit.w.who[0])
    /* ...and specifically the puck sitting in the anchored seat's aircraft row,
       not wherever the name appears first in the day's markup */
    const row = tgt.closest('.acrow')
    expect(row, 'the destination is a flight line').toBeTruthy()
    expect(row!.querySelector(`[data-slot="${hit.w.key}"]`),
      `the line holds the anchored seat ${hit.w.key}`).toBeTruthy()
  })

  it('SIM_BRIEF pans to the sim row that briefs', async () => {
    const hit = findWarn((w: any) => w.code === 'SIM_BRIEF')
    expect(hit, 'the seed week has a SIM_BRIEF').toBeTruthy()
    const tgt = await jump(hit)
    expect(tgt, 'it scrolled somewhere').toBeTruthy()
    const day = $(`#eWeek .day[data-day="${hit.di}"]`)
    const want = rowOf(day, hit.w.key)
    expect(want, `the day renders the anchored sim row ${hit.w.key}`).toBeTruthy()
    expect(want!.contains(tgt), 'the destination sits inside that sim row').toBe(true)
  })

  it('DOUBLE_BOOK pans to the first-named clashing item\'s line', async () => {
    const hit = findWarn((w: any) => w.code === 'DOUBLE_BOOK' && !!w.key)
    expect(hit, 'the seed week has a DOUBLE_BOOK').toBeTruthy()
    const tgt = await jump(hit)
    expect(tgt, 'it scrolled somewhere').toBeTruthy()
    const day = $(`#eWeek .day[data-day="${hit.di}"]`)
    const want = rowOf(day, hit.w.key)
    expect(want, `the day renders the anchored line ${hit.w.key}`).toBeTruthy()
    expect(want!.contains(tgt), 'the destination sits inside the first-named item\'s line').toBe(true)
  })

  it('the board surface resolves the same anchors in its own panels', async () => {
    const hit = findWarn((w: any) => w.code === 'SIM_BRIEF')
    expect(hit, 'the seed week has a SIM_BRIEF').toBeTruthy()
    await act(async () => { view.selDrop(); openScheduler(hit.di); notify() })
    scrolled.length = 0
    await click($(`#sbWarn .wln[data-wix="${hit.ix}"]`))
    await flush()
    const tgt = scrolled[scrolled.length - 1] as HTMLElement
    expect(tgt, 'it scrolled somewhere').toBeTruthy()
    expect(tgt.closest('.sb-boardwrap'), 'inside the board, never the roster').toBeTruthy()
    expect(tgt.closest('#sbRoster')).toBeFalsy()
    const row = tgt.closest('.sb-arow')
    expect(row, 'the destination is a board sim row').toBeTruthy()
    expect([...row!.querySelectorAll('[data-slot],[data-fill]')].some((el: any) => {
      const k = el.dataset.slot || el.dataset.fill
      return k === hit.w.key || (k && k.indexOf(hit.w.key + '.') === 0)
    }, ), `the row speaks the anchored key ${hit.w.key}`).toBe(true)
    await act(async () => { view.setBoardDay(null); notify() })
  })

  it('an unresolvable key falls back to the old rule, verbatim', async () => {
    const hit = findWarn((w: any) => (w.who || []).length === 1)
    expect(hit, 'a one-person warning to test with').toBeTruthy()
    /* WARN is live state; a key can go stale the moment an edit rebuilds it.
       Simulate exactly that: point the warning at a line that no longer exists. */
    const saved = hit.w.key
    hit.w.key = '9.9.9.9.p'
    try {
      const tgt = await jump(hit)
      expect(tgt, 'it still scrolled').toBeTruthy()
      /* the old rule: the first puck of the named person in document order,
         Available-crew grid excluded */
      const day = $(`#eWeek .day[data-day="${hit.di}"]`)
      const want = [...day.querySelectorAll(`.puck[data-person="${hit.w.who[0]}"]`)]
        .find(p => !p.closest('.availpuck'))
      expect(tgt, 'the fallback is today\'s behaviour exactly').toBe(want)
    } finally { hit.w.key = saved }
  })

  it('the anchor match is segment-safe: a row prefix never claims a longer index', () => {
    const root = document.createElement('div')
    root.innerHTML = '<span data-slot="s:0.oft.12.p"></span><span data-slot="s:0.oft.1.p"></span>'
    expect((anchorEl(root, 's:0.oft.1') as any)?.dataset.slot).toBe('s:0.oft.1.p')
    expect((anchorEl(root, 's:0.oft.12') as any)?.dataset.slot).toBe('s:0.oft.12.p')
    expect(anchorEl(root, 's:0.oft.3')).toBeNull()
    expect(anchorEl(root, null)).toBeNull()
  })
})

/* THE CLICKED ROW SAYS SO, ON EVERY SURFACE (owner, 7 Aug 26). The week's
   issue rows and the board's Live checks always marked the active row; the
   day-detail panel and the cross-day crew-rest row were the two navigating
   surfaces that did not — click one and nothing on the page said which row
   was lit. The puck lighting itself is DELIBERATELY unchanged: the owner
   considered painting the warning's first-named in the selection blue and
   declined it — a warning click lights the whole affected crew in the warning
   colours and fades the rest; blue stays what it always was, the puck-click
   selection. */
describe('the clicked row marks itself on every surface', () => {
  it('the day-detail panel marks the focused row when reopened', async () => {
    const di = warnDay()
    /* an earlier describe drives #eWeek and leaves CURPAGE there — #vWeek's
       markup freezes while it is not the current page, so come back first */
    await act(async () => { view.setPage('viewsched'); view.setBoardDay(null); view.selDrop(); view.toggleDayWarn(di); notify() })
    await click($(`#vWeek .day[data-day="${di}"] .witem[data-wdi="${di}"][data-wix="0"]`))
    await flush()
    await click($(`#vWeek .day[data-day="${di}"] [data-dayinfo]`))
    const on = $('#dayPopBody .witem.on') as HTMLElement
    expect(on, 'the active row is marked in the panel too').toBeTruthy()
    expect(on.dataset.adv).toBe(`${di}.0`)
    /* clicking it closes the panel (its own contract) and leaves the same
       focus — which the beforeEach then clears */
    await click(on)
  })

  it('the cross-day row marks itself while its warning is the focus', async () => {
    await act(async () => {
      view.setPage('viewsched'); view.setBoardDay(null); view.selDrop()
      WARN.byDay.forEach((g: any) => { if (g) view.toggleDayWarn(g.di) })
      notify()
    })
    const row = $('#vWeek .dwtrace .witem[data-wdi]')
    expect(row, 'the causing day carries its cross-day row').toBeTruthy()
    expect(row.classList.contains('on'), 'quiet until clicked').toBe(false)
    await click(row)
    await flush()
    expect($('#vWeek .dwtrace .witem[data-wdi]')!.classList.contains('on'),
      'lit once its warning is the focus').toBe(true)
    /* and a second click toggles it back off, like any other row */
    await click($('#vWeek .dwtrace .witem[data-wdi]'))
    await flush()
    expect($('#vWeek .dwtrace .witem[data-wdi]')!.classList.contains('on')).toBe(false)
  })
})
