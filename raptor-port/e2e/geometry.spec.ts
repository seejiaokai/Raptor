/* The measured layout contracts from docs/ui-contracts.md §Rendering.

   These are the ones the note in that file calls "measured, suite-enforced"
   — and until now they were enforced only by hand, because jsdom has no
   layout engine: every rect in Vitest is 0x0, so a puck that had silently
   grown to 90px, or free text that had started overflowing its cell, would
   pass `npm test` all day. Here they run in a real browser on the real
   production build, so a CSS change that breaks one fails a gate. */
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { clickHere, go, login, pan, puckSize, scrollTo, settle, settleBoth, settleWeek } from './app'

const PHONE = { width: 390, height: 844 }
const DESK = { width: 1500, height: 950 }

/* every free-text cell on the dense surfaces: these must WRAP (grow taller),
   never widen their column or spill over the neighbour */
const FREETEXT = '.ah-row>.nm, .pl-row>.nm, .pl-row .rmk, .ah-note, .rmkcell, .ppl .itxt, .areacell'
/* the subset that owns a whole grid/flex column and holds prose. `.itxt` is
   deliberately not here: it is an unresolved NAME sitting inline among the
   pucks, sized by its content on purpose, and it takes the overflow check
   above like everything else. */
const PROSE = '.ah-row>.nm, .pl-row>.nm, .pl-row .rmk, .ah-note, .rmkcell, .areacell'

test.describe('the puck is one fixed size everywhere', () => {
  for (const [name, viewport] of [['phone', PHONE], ['desktop', DESK]] as const) {
    test(`74x15 on ${name}, on both week surfaces and in the palette`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await login(page)
      const want = await puckSize(page)
      expect(want, 'the two custom properties every grid derives from').toEqual({ w: 74, h: 15 })

      for (const surface of ['viewsched', 'editsched'] as const) {
        await go(page, surface)
        const odd = await page.evaluate(([sel, w, h]) => {
          const root = document.getElementById(sel === 'editsched' ? 'eWeek' : 'vWeek')!
          return [...root.querySelectorAll('.puck')]
            .map(el => { const r = el.getBoundingClientRect(); return { w: +r.width.toFixed(1), h: +r.height.toFixed(1) } })
            .filter(r => r.w !== w || r.h !== h)
            .slice(0, 4)
        }, [surface, want.w, want.h] as const)
        expect(odd, `${surface}: every puck is exactly --puck-w x --puck-h`).toEqual([])
      }

      /* the palette is built by the same builders and must match */
      const pal = await page.evaluate(() => [...document.querySelectorAll('#eRoster .rpuck .puck')]
        .map(el => { const r = el.getBoundingClientRect(); return +r.width.toFixed(1) }))
      expect(pal.length, 'the palette drew some pucks to measure').toBeGreaterThan(0)
      expect([...new Set(pal)], 'palette pucks are the same width as week pucks').toEqual([want.w])
    })
  }

  test('the seat column of the form grid is derived from --puck-w', async ({ page }) => {
    await page.setViewportSize(DESK)
    await login(page)
    /* calc(var(--puck-w)*2 + 16px) — two pucks side by side plus the gaps.
       A hard-coded pixel value here is how the grid and the puck drift apart. */
    const { col, want } = await page.evaluate(() => {
      const f = document.querySelector('#vWeek .form')!
      const w = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--puck-w'))
      return { col: getComputedStyle(f).gridTemplateColumns.split(' ')[3], want: w * 2 + 16 }
    })
    expect(parseFloat(col)).toBeCloseTo(want, 1)
  })
})

test.describe('free text wraps instead of overflowing', () => {
  for (const [name, viewport] of [['phone', PHONE], ['desktop', DESK]] as const) {
    test(`no free-text cell spills its box on ${name}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await login(page)
      for (const surface of ['viewsched', 'editsched'] as const) {
        await go(page, surface)
        const bad = await page.evaluate(([sel, q]) => {
          const root = document.getElementById(sel === 'editsched' ? 'eWeek' : 'vWeek')!
          return [...root.querySelectorAll(q)]
            .filter(el => el.scrollWidth - el.clientWidth > 1)
            .map(el => (el.className || '?').split(' ')[0] + ' +' + (el.scrollWidth - el.clientWidth))
            .slice(0, 5)
        }, [surface, FREETEXT] as const)
        expect(bad, `${surface}: free text stays inside its own cell`).toEqual([])
      }
    })
  }

  test('and it wraps because of the two rules that make it wrap', async ({ page }) => {
    await page.setViewportSize(DESK)
    await login(page)
    /* overflow-wrap:anywhere alone is not enough — a grid/flex child defaults
       to min-width:auto, which refuses to shrink below its longest word and
       widens the whole column instead. Both rules, or neither works. */
    const missing = await page.evaluate(q => [...document.querySelectorAll('#vWeek ' + q)]
      .map(el => ({ cls: (el.className || '?').split(' ')[0], cs: getComputedStyle(el) }))
      .filter(x => x.cs.overflowWrap !== 'anywhere' || x.cs.minWidth !== '0px')
      .map(x => `${x.cls} wrap:${x.cs.overflowWrap} min:${x.cs.minWidth}`)
      .slice(0, 5), PROSE)
    expect(missing.length, 'every prose cell carries both rules').toBe(0)
    expect(missing).toEqual([])
  })

  test('a whole week of jammed free text still gains no sideways swipe', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await login(page)
    await go(page, 'viewsched')
    const JAM = 'shahdbsbsnanansjsnsnsjsjmsnsnsnsnsnsnsnnsndbdndnsnsnsnsns'
    await page.evaluate(jam => {
      const w = window as any
      const d = w.DAYS[0]
      d.allhands = [{ prog: 'SODB ' + jam, sub: jam, str: '0745', end: '0815', who: [] }]
      d.notes = ['EP: ' + jam]
      ;(d.ground || (d.ground = [])).push({ prog: jam, str: '1000', end: '1030', who: '', rmks: jam })
      w.validate(); w.renderSchedule()
    }, JAM)
    await page.waitForTimeout(400)
    const r = await page.evaluate(() => {
      const day = document.querySelector('#vWeek [data-day="0"]') as HTMLElement
      const jammed = [...day.querySelectorAll('.ah-row')].find(x => /shahdbsbsna/.test(x.textContent || ''))
      return {
        dayOver: Math.max(0, day.scrollWidth - day.clientWidth),
        pageOver: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        lines: jammed ? Math.round((jammed.querySelector(':scope>.nm') as HTMLElement).getBoundingClientRect().height) : -1,
      }
    })
    expect(r.dayOver, 'the day column does not widen into a swipe').toBe(0)
    expect(r.pageOver, 'and neither does the page').toBe(0)
    expect(r.lines, 'the row grew taller instead — the text really is there').toBeGreaterThan(26)
  })
})

test.describe('the week pans by whole day boxes', () => {
  test('one arrow click = one day box, and the proxy scrollbar maps 1:1', async ({ page }) => {
    await page.setViewportSize(DESK)
    await login(page)
    await go(page, 'viewsched')
    /* the step is the live box+gap, exactly as pan.ts measures it — a day box
       is not scrollWidth/days once the gaps are counted */
    const step = await page.evaluate(() => {
      const ds = document.querySelectorAll('#vWeek .day')
      return ds.length > 1 ? Math.round((ds[1] as HTMLElement).offsetLeft - (ds[0] as HTMLElement).offsetLeft) : 0
    })
    expect(step, 'a day box has a width to pan by').toBeGreaterThan(0)

    /* the real arrow buttons, so this covers the wiring too */
    const zero = await scrollTo(page, '#vWeek', 0)
    const one = await pan(page, '#vWeek', 1, zero)
    expect(Math.abs(one - step), 'one click moved exactly one day box').toBeLessThanOrEqual(2)

    const two = await pan(page, '#vWeek', 1, one)
    expect(Math.abs(two - step * 2), 'and the next click moved exactly one more').toBeLessThanOrEqual(2)

    const back = await pan(page, '#vWeek', -1, two)
    expect(Math.abs(back - step), 'and back again, one box at a time').toBeLessThanOrEqual(2)

    /* the proxy scrollbar is a linear map of the week's own scroll — the echo
       guard (HS_EPS) must not cost it accuracy */
    const map = await page.evaluate(() => {
      const w = document.querySelector('#vWeek') as HTMLElement
      const trk = document.querySelector('.hs-track') as HTMLElement
      if (!trk) return null
      const over = w.scrollWidth - w.clientWidth, tmax = trk.scrollWidth - trk.clientWidth
      return { want: Math.round((w.scrollLeft / over) * tmax), got: Math.round(trk.scrollLeft) }
    })
    if (map) expect(Math.abs(map.got - map.want), 'the proxy sits where the week is').toBeLessThanOrEqual(2)
  })

  test('an edit does not throw the week back to Monday', async ({ page }) => {
    await page.setViewportSize(DESK)
    await login(page)
    await go(page, 'editsched')
    const before = await scrollTo(page, '#eWeek', 400)
    expect(before, 'the week scrolled far enough to notice a jump').toBeGreaterThan(0)

    await page.evaluate(() => { const w = window as any; w.txtSet('dn:0.0', 'GEOMETRY PROBE'); w.afterSchedMutate() })
    await page.waitForTimeout(300)
    expect(await settle(page, '#eWeek'), 'an edit holds the scroll').toBe(before)
  })
})

test('a hole in a programme row renders no element at all', async ({ page }) => {
  await page.setViewportSize(DESK)
  await login(page)
  await go(page, 'editsched')
  /* an empty name rendered as an empty <span class=itxt> is a zero-width flex
     item that still eats the row's gap, so every later puck slides left of
     where its column says it should be. The builder must emit nothing. */
  const r = await page.evaluate(() => {
    const w = window as any
    const d = w.DAYS[0]
    const row = (d.allhands || [])[0]
    if (!row) return null
    const people = Object.keys(w.PEOPLE).filter(x => !w.PEOPLE[x].special)
    row.who = [w.PEOPLE[people[0]].cs, w.PEOPLE[people[1]].cs]
    w.afterSchedMutate()
    return { cs: [w.PEOPLE[people[0]].cs, w.PEOPLE[people[1]].cs] }
  })
  test.skip(!r, 'the seed day has no squadron-wide row to plant into')
  await page.waitForTimeout(350)
  const solid = await page.evaluate(() => {
    const row = document.querySelector('#eWeek [data-day="0"] .ah-row .ppl') as HTMLElement
    return { empties: row.querySelectorAll('.itxt').length, lefts: [...row.querySelectorAll('.seat')].map(e => Math.round(e.getBoundingClientRect().left)) }
  })

  /* now punch a hole in the middle and re-render */
  await page.evaluate(cs => {
    const w = window as any
    w.DAYS[0].allhands[0].who = [cs[0], '', cs[1]]
    w.afterSchedMutate()
  }, r!.cs)
  await page.waitForTimeout(350)
  const holed = await page.evaluate(() => {
    const row = document.querySelector('#eWeek [data-day="0"] .ah-row .ppl') as HTMLElement
    return { empties: row.querySelectorAll('.itxt').length, lefts: [...row.querySelectorAll('.seat')].map(e => Math.round(e.getBoundingClientRect().left)) }
  })
  expect(holed.empties, 'the hole rendered no element').toBe(solid.empties)
  expect(holed.lefts, 'so the pucks either side did not shift').toEqual(solid.lefts)
})

/* THE BOARD'S DUTY ROWS ON A PHONE (owner sweep, 6 Aug 26). `.sb-arow.c6r` is
   two classes where the phone rule is one, and a media query adds no
   specificity, so the six-column desktop template kept winning at 390px: the
   ITEM column — the only thing saying WHICH duty a row is — collapsed to a
   14px stub while START and END stayed perfectly legible beside it. Desktop
   was always fine, which is why it went unseen. */
test('the board\'s duty rows keep a readable ITEM column on a phone', async ({ page }) => {
  await page.setViewportSize(PHONE)
  await login(page)
  await go(page, 'editsched')
  await page.evaluate(() => (window as any).openScheduler(1))
  await page.waitForSelector('#schedBoard .sb-arow input.ain')

  const m = await page.evaluate(() => {
    const ins = [...document.querySelectorAll('#schedBoard .sb-arow.c6r input.ain')] as HTMLInputElement[]
    const named = ins.filter(e => (e.value || '').trim().length > 2)
    if (!named.length) return null
    return {
      /* nothing may be squeezed narrower than the text it holds */
      worstOverflow: Math.max(...named.map(e => e.scrollWidth - e.clientWidth)),
      narrowest: Math.min(...named.map(e => Math.round(e.getBoundingClientRect().width))),
      columns: getComputedStyle(named[0].parentElement!).gridTemplateColumns.split(' ').length,
    }
  })
  test.skip(!m, 'no named duty row on the seed board')
  expect(m!.columns, 'the phone template is three columns, not the desktop six').toBe(3)
  expect(m!.worstOverflow, 'the item name is not clipped by its own box').toBeLessThanOrEqual(0)
  expect(m!.narrowest, 'and the item column is actually readable').toBeGreaterThan(80)
})

/* A CALLSIGN THAT DOES NOT FIT MUST LOOK CUT (owner sweep, 6 Aug 26). The rule
   asked for an ellipsis and never got one — `text-overflow` is ignored on a
   flex container — so a long name was hard-clipped and "Wrangler" read as
   "Wrangl". Only a browser can catch this: jsdom has no layout, so scrollWidth
   and clientWidth are both 0 there and nothing ever overflows. */
test('a callsign too long for its puck fades instead of being clipped clean', async ({ page }) => {
  await page.setViewportSize(DESK)
  await login(page)
  await go(page, 'viewsched')

  const m = await page.evaluate(() => {
    const nms = [...document.querySelectorAll('#vWeek .puck .nm')] as HTMLElement[]
    const over = (n: HTMLElement) => n.scrollWidth - n.clientWidth
    const cut = nms.filter(n => over(n) > 0)
    const fits = nms.filter(n => over(n) <= 0)
    const cs = (n: HTMLElement) => getComputedStyle(n)
    return {
      cutCount: cut.length, fitCount: fits.length,
      /* the fade has to be on the element that does the clipping */
      mask: cut[0] ? (cs(cut[0]).maskImage || (cs(cut[0]) as any).webkitMaskImage) : null,
      display: cut[0] ? cs(cut[0]).display : null,
      /* and the box itself must not have moved to make room for it */
      puck: cut[0] ? (() => { const r = cut[0].closest('.puck')!.getBoundingClientRect()
        return { w: +r.width.toFixed(1), h: +r.height.toFixed(1) } })() : null,
    }
  })
  test.skip(m.cutCount === 0, 'no callsign in the seed week is long enough to be cut')
  expect(m.fitCount, 'and some names do fit, so the rule is not just always-on').toBeGreaterThan(0)
  expect(m.display, 'a flex container would silently ignore the overflow rules').toBe('block')
  expect(m.mask, 'the overflowing name is faded, not clipped clean').toContain('gradient')
  expect(m.puck, 'and the puck is still the measured box').toEqual({ w: 74, h: 15 })
})

/* THE THREE CREW-REST STROKES, measured (owner, 6 Aug 26). Solid is his own
   breach, dashed is his own breach that a scheduler sanctioned, dotted is the
   day he CAUSES one. Vitest can prove which class the builder emitted and
   nothing more: jsdom applies no stylesheet, so "the dash renders as a dash"
   was untestable there — and it was not true. `.puck.warn.hard` puts a solid
   1.5px ring on any hard-flagged puck, `.boxdash` only added an outline on top
   of it, and the solid ring filled in every gap from behind: a sanctioned late
   show came out a fat solid red box, which is what the owner reported. */
test.describe('the crew-rest rings are three distinguishable strokes', () => {
  test('dashed is not filled in from behind, and dotted clears the solid ring', async ({ page }) => {
    await page.setViewportSize(DESK)
    await login(page)
    await go(page, 'editsched')

    /* Drive the seed to a state that renders all three at once. The seed's one
       crew-rest breach (casper, Tue, traced back to Mon) is too deep for a late
       show to save — rest clears 10:45, the latest show is 07:40 — so the
       remark alone leaves it solid; shortening crew rest is what puts it in the
       sanctioned band. Both go through the ordinary funnel. */
    const ok = await page.evaluate(() => {
      const w = window as any
      const seat = [...document.querySelectorAll('#eWeek [data-day="1"] .seat[data-slot]')]
        .find(s => s.querySelector('.puck[data-person="casper"]')) as HTMLElement | undefined
      if (!seat) return false
      w.txtSet('fr:' + seat.dataset.slot!.split('.').slice(0, 4).join('.'), 'LATE SHOW')
      w.VCONF.crewRest = 480
      w.afterSchedMutate()
      return true
    })
    test.skip(!ok, 'the seed no longer seats casper on the crew-rest line')
    await page.waitForTimeout(400)

    const r = await page.evaluate(() => {
      const read = (sel: string) => {
        const el = document.querySelector(sel) as HTMLElement
        if (!el) return null
        const cs = getComputedStyle(el), b = el.getBoundingClientRect()
        return { shadow: cs.boxShadow, style: cs.outlineStyle, width: parseFloat(cs.outlineWidth),
          off: parseFloat(cs.outlineOffset), w: +b.width.toFixed(1), h: +b.height.toFixed(1) }
      }
      return { dash: read('#eWeek .puck.boxdash'), dot: read('#eWeek .puck.boxdot:not(.boxred)'),
        red: read('#eWeek .puck.boxred:not(.boxdot)') }
    })
    expect(r.dash, 'the sanctioned late show renders').not.toBeNull()
    expect(r.dot, 'and so does the day that caused the breach').not.toBeNull()
    expect(r.red, 'and an ordinary hard flag').not.toBeNull()

    /* THE BUG: any box-shadow at all here is a solid ring behind the dashes */
    expect(r.dash!.shadow, 'nothing solid is drawn behind the dashes').toBe('none')
    expect(r.dash!.style, 'and the stroke really is dashed').toBe('dashed')

    expect(r.dot!.style, 'the trace is dotted, not dashed').toBe('dotted')
    expect(r.dot!.width, 'and lighter than the dashed stroke, or the two read alike')
      .toBeLessThan(r.dash!.width)

    /* the solid ring keeps its shadow — that is how .boxred draws — and the
       dotted trace has to sit OUTSIDE its 2px spread or it vanishes into it */
    expect(r.red!.shadow, 'the solid ring is still a shadow').toContain('px')
    expect(r.red!.style, 'and draws no outline of its own').toBe('none')
    const spread = 2
    expect(r.dot!.off, 'the dots clear the solid ring rather than hiding in it')
      .toBeGreaterThanOrEqual(spread)

    /* and none of it moves the puck: outlines do not take part in layout, which
       is the reason both rings are outlines and not shadows */
    for (const [name, m] of Object.entries(r)) {
      expect({ name, w: m!.w, h: m!.h }, `${name} keeps the measured puck box`)
        .toEqual({ name, w: 74, h: 15 })
    }
  })

  test('the cross-day row sits inside the list, same box as its neighbours', async ({ page }) => {
    /* Owner, 7 Aug 26: the "Breaks Tuesday" row used to render after the whole
       list in its own narrower dotted container. It now ranks below the
       warnings and above the advisories, in the row box everyone else gets —
       which is geometry, so it is gated here and not in jsdom. */
    await page.setViewportSize(PHONE)
    await login(page)
    await go(page, 'viewsched')
    await page.click('#vWeek .day[data-day="0"] [data-daywarn]')
    await page.waitForTimeout(400)
    const r = await page.evaluate(() => {
      const list = document.querySelector('#vWeek .day[data-day="0"] .dwlist')
      const tr = list && list.querySelector('.dwtrace .witem') as HTMLElement
      if (!list || !tr) return null
      const sib = [...list.querySelectorAll(':scope > .witem')] as HTMLElement[]
      const kinds = [...list.querySelectorAll('.witem')].map(el =>
        el.closest('.dwtrace') ? 'trace' : (el.classList.contains('hard') ? 'hard' : el.classList.contains('adv') ? 'adv' : 'note'))
      const t = tr.getBoundingClientRect(), s = sib[0].getBoundingClientRect()
      const ts = getComputedStyle(tr), ss = getComputedStyle(sib[0])
      return {
        kinds,
        sameWidth: Math.abs(t.width - s.width) < 0.6,
        sameLeft: Math.abs(t.left - s.left) < 0.6,
        sameBorder: ts.borderTopStyle === ss.borderTopStyle && ts.borderTopColor === ss.borderTopColor,
        samePad: ts.padding === ss.padding,
      }
    })
    expect(r, 'Monday renders its list with the cross-day row inside it').not.toBeNull()
    const ti = r!.kinds.indexOf('trace')
    expect(ti, 'the row is in the list').toBeGreaterThan(-1)
    expect(r!.kinds.slice(0, ti).every(k => k === 'hard'), 'below the warnings').toBe(true)
    expect(r!.kinds.slice(ti + 1).every(k => k !== 'hard'), 'above the advisories').toBe(true)
    expect(r!.sameWidth, 'same width as a sibling row').toBe(true)
    expect(r!.sameLeft, 'same left edge').toBe(true)
    expect(r!.sameBorder, 'same border, not the old dotted box').toBe(true)
    expect(r!.samePad, 'same padding').toBe(true)
  })

  /* THE ROW PANS TO ITS OWN DAY (owner, from the deployed site, 7 Aug 26). It
     used to throw the week over to the breach day and land on the flagged leg —
     which the row's own prose had already named — while the sortie that ran
     late, the only one a scheduler can still move, was left behind.

     A phone is the viewport that can prove it: one day box fills the screen, so
     Monday and Tuesday cannot both be in view and "did not move" is a real
     measurement. On the desktop width both would be visible and the lateral
     hold would keep the week still for the wrong reason. */
  test('the cross-day row pans to the late line on its own day', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await login(page)
    await go(page, 'viewsched')
    await page.click('#vWeek .day[data-day="0"] [data-daywarn]')
    await page.waitForSelector('#vWeek .day[data-day="0"] .dwtrace .witem[data-wdi]')
    await scrollTo(page, '#vWeek', 0)

    /* clickHere, not page.click: Playwright scrolls a target into view before
       pressing it, which would pan the week for us and defeat the measurement */
    expect(await clickHere(page, '#vWeek .day[data-day="0"] .dwtrace .witem[data-wdi]')).toBe(true)
    await settleBoth(page, '#vWeek')

    const m = await page.evaluate(() => {
      const week = document.querySelector('#vWeek') as HTMLElement
      const day = document.querySelector('#vWeek .day[data-day="0"]') as HTMLElement
      const row = document.querySelector('#vWeek .day[data-day="0"] .dwtrace .witem[data-wdi]') as HTMLElement
      /* the causing day's man is ECHO-lit: the focused warning is tomorrow's,
         so his puck here wears the dashed same-person-different-day mark on top
         of its standing dotted ring */
      const puck = document.querySelector('#vWeek .day[data-day="0"] .puck.wfoc.echo') as HTMLElement
      if (!puck || !row) return null
      const w = week.getBoundingClientRect(), p = puck.getBoundingClientRect()
      const seat = row.dataset.wpk
        ? document.querySelector(`#vWeek .day[data-day="0"] [data-slot^="${row.dataset.wpk}"]`)
        : null
      const s = getComputedStyle(puck)
      return {
        focusDay: row.dataset.wdi,                                     // still tomorrow's warning
        dayOffset: Math.round(day.getBoundingClientRect().left - w.left),
        inView: p.left >= w.left - 1 && p.right <= w.right + 1,
        /* the trace class survives the focus, so the standing dotted ring comes
           back when it clears; while lit, .wfoc.echo's dashed stroke is what is
           actually PAINTED (one outline per element, and it is declared later) */
        stillTraced: puck.classList.contains('boxdot'),
        stroke: s.outlineStyle,
        strokeColor: s.outlineColor,
        inCausingRow: !!seat && !!seat.closest('.acrow,.pl-row,.ah-row')?.contains(puck),
      }
    })
    expect(m, 'the causing day lights its own puck').not.toBeNull()
    expect(m!.focusDay, 'the row still addresses tomorrow\'s breach').toBe('1')
    expect(m!.dayOffset, 'and the week never left the day it was clicked on').toBe(0)
    expect(m!.inView, 'the late line\'s puck is inside the week viewport').toBe(true)
    expect(m!.stillTraced, 'it keeps its trace mark under the focus').toBe(true)
    expect(m!.stroke, 'and paints the dashed same-man-elsewhere stroke').toBe('dashed')
    expect(m!.strokeColor, 'in the hard red, not the advisory amber').toBe('rgb(240, 85, 95)')
    expect(m!.inCausingRow, 'and it is the line the engine blamed, not his first').toBe(true)
  })
})

test('puck text stays inside the puck, descenders and all', async ({ page }) => {
  await page.setViewportSize(PHONE)
  await login(page)
  await go(page, 'viewsched')
  /* the reference's `ink` probe measured this by Range, not by the cell box:
     9px type on a 15px puck, and the tail of a g/j/p/q/y must not hang below
     the puck's own bottom edge by more than a hair. */
  const worst = await page.evaluate(() => {
    let over = -Infinity, sample = ''
    for (const p of [...document.querySelectorAll('#vWeek .puck')].slice(0, 60)) {
      const nm = p.querySelector('.nm'); if (!nm) continue
      const t = nm.textContent || ''; if (!/[gjpqy]/.test(t)) continue
      const rg = document.createRange(); rg.selectNodeContents(nm)
      const ink = rg.getBoundingClientRect().bottom - p.getBoundingClientRect().bottom
      if (ink > over) { over = ink; sample = t.trim().slice(0, 12) }
    }
    return { over, sample, fs: getComputedStyle(document.querySelector('#vWeek .puck .nm')!).fontSize }
  })
  test.skip(worst.over === -Infinity, 'no descender on screen to measure')
  expect(worst.fs, 'puck type is 9px').toBe('9px')
  expect(worst.over, `descender ink of "${worst.sample}" stays inside the puck`).toBeLessThanOrEqual(0)
})

/* ── Warning navigation ─────────────────────────────────────────────────────
   Clicking an issue is supposed to bring the offending puck into view. jsdom
   cannot see any of this — it has no layout and does not implement
   scrollIntoView — so warnjump.test.tsx can only pin WHICH element is aimed
   at. Whether the element actually ends up on screen is measurable here and
   nowhere else. Desktop only: .week{scroll-snap-type} is switched off below
   820px (scheduler.css), and the snap is half of what these guard. */
test.describe('clicking a warning brings the puck into view', () => {
  test('the week lands on the day, on its snap point, with the puck on screen', async ({ page }) => {
    await page.setViewportSize(DESK)
    await login(page)
    await go(page, 'viewsched')

    /* Find a flagged day that is genuinely OFF SCREEN from the left edge, and
       measure that rather than counting day boxes: the pan is conditional now
       (owner, 6 Aug 26 — it holds the lateral view when the target is already
       visible), so a day merely "far enough along" is not the same question.
       At 1500px the third day box hangs half into view, and picking it would
       exercise the hold path while asserting the pan path's snap. */
    await scrollTo(page, '#vWeek', 0)
    const di = await page.evaluate(() => {
      const wr = (document.querySelector('#vWeek') as HTMLElement).getBoundingClientRect()
      const hit = [...document.querySelectorAll('#vWeek .day[data-day]')]
        .find(d => d.querySelector('.daywarn[data-daywarn]') && d.getBoundingClientRect().left >= wr.right)
      return hit ? +(hit as HTMLElement).dataset.day! : -1
    })
    test.skip(di < 0, 'no flagged day off screen to scroll to')

    await page.click(`#vWeek .day[data-day="${di}"] .daywarn[data-daywarn]`)
    await page.waitForSelector(`#vWeek .day[data-day="${di}"] .dwlist .witem[data-wdi]`)
    await scrollTo(page, '#vWeek', 0)          // the expand may have nudged it

    /* clickHere, not page.click: an actionable click would scroll the row into
       view first and hand the app a week already panned onto the day, which is
       the very move under test */
    expect(await clickHere(page, `#vWeek .day[data-day="${di}"] .dwlist .witem[data-wdi]`)).toBe(true)
    await settleBoth(page, '#vWeek')

    const m = await page.evaluate((d) => {
      const week = document.querySelector('#vWeek') as HTMLElement
      const day = document.querySelector(`#vWeek .day[data-day="${d}"]`) as HTMLElement
      const puck = document.querySelector('#vWeek .puck.wfoc:not(.echo)') as HTMLElement
      if (!puck) return null
      const w = week.getBoundingClientRect(), p = puck.getBoundingClientRect()
      return {
        inView: p.left >= w.left - 1 && p.right <= w.right + 1,
        /* the snap assertion: inline:'center' asks to rest between two snap
           points, so the browser re-snaps and can leave you a whole day past
           the one you clicked. On the snap point, this delta is 0. */
        dayOffset: Math.round(day.getBoundingClientRect().left - w.left),
      }
    }, di)
    expect(m, 'a focused puck is on the page').not.toBeNull()
    expect(m!.dayOffset, 'the week rests on the day\'s snap point, not between two').toBe(0)
    expect(m!.inView, 'the offending puck is inside the week viewport').toBe(true)
  })

  /* THE HOLD (owner, 6 Aug 26). The pan above used to run on every click, so a
     warning on a day you were already reading — the second day box, sitting
     mid-screen — snapped that day hard to the left edge and threw the rest of
     the week off the side, for no gain: the puck was already in front of you.
     The horizontal now moves only when the destination is genuinely not on
     screen. Measurable here and nowhere else: jsdom reports every rect as 0×0,
     so it cannot tell "in view" from "off screen" at all. */
  test('a warning already on screen does not move the week sideways', async ({ page }) => {
    await page.setViewportSize(DESK)
    await login(page)
    await go(page, 'viewsched')
    await scrollTo(page, '#vWeek', 0)

    /* a flagged day that is NOT the leftmost, parked one snap point back so it
       sits in the middle of the viewport — the exact case that was reported */
    const pick = await page.evaluate(() => {
      const days = [...document.querySelectorAll('#vWeek .day[data-day]')] as HTMLElement[]
      const week = document.querySelector('#vWeek') as HTMLElement
      const wr = week.getBoundingClientRect()
      for (const d of days) {
        const di = +d.dataset.day!
        if (di < 1 || !d.querySelector('.daywarn[data-daywarn]')) continue
        const prev = days.find(x => +x.dataset.day! === di - 1)!
        return { di, at: Math.round(week.scrollLeft + prev.getBoundingClientRect().left - wr.left) }
      }
      return null
    })
    test.skip(!pick, 'no flagged day with a day before it')

    await page.click(`#vWeek .day[data-day="${pick!.di}"] .daywarn[data-daywarn]`)
    await page.waitForSelector(`#vWeek .day[data-day="${pick!.di}"] .dwlist .witem[data-wdi]`)
    await scrollTo(page, '#vWeek', pick!.at)

    const before = await page.evaluate(() => Math.round((document.querySelector('#vWeek') as HTMLElement).scrollLeft))
    /* it has to actually BE on screen, or the hold proves nothing */
    const visible = await page.evaluate((d) => {
      const week = document.querySelector('#vWeek') as HTMLElement
      const day = document.querySelector(`#vWeek .day[data-day="${d}"]`) as HTMLElement
      const w = week.getBoundingClientRect(), r = day.getBoundingClientRect()
      return r.left >= w.left - 1 && r.right <= w.right + 1
    }, pick!.di)
    test.skip(!visible, 'the day does not fit on screen beside its neighbour')

    expect(await clickHere(page, `#vWeek .day[data-day="${pick!.di}"] .dwlist .witem[data-wdi]`)).toBe(true)
    await settleWeek(page, '#vWeek')

    const after = await page.evaluate(() => {
      const week = document.querySelector('#vWeek') as HTMLElement
      const puck = document.querySelector('#vWeek .puck.wfoc:not(.echo)') as HTMLElement
      const w = week.getBoundingClientRect()
      const p = puck && puck.getBoundingClientRect()
      return {
        left: Math.round(week.scrollLeft),
        inView: !!p && p.left >= w.left - 1 && p.right <= w.right + 1,
      }
    })
    expect(after.left, 'the lateral view is exactly where it was left').toBe(before)
    expect(after.inView, 'and the puck was on screen all along').toBe(true)
  })

  test('the board scrolls its own panel to the puck', async ({ page }) => {
    await page.setViewportSize(DESK)
    await login(page)
    await go(page, 'editsched')

    const di = await page.evaluate(() => {
      const days = [...document.querySelectorAll('#eWeek .day[data-day]')]
      const hit = days.find(d => d.querySelector('.daywarn[data-daywarn]'))
      return hit ? +(hit as HTMLElement).dataset.day! : -1
    })
    test.skip(di < 0, 'no flagged day in the seed week')

    await page.evaluate((d) => (window as any).openScheduler(d), di)
    await page.waitForSelector('#sbWarn .wln[data-wdi]')
    /* start from the bottom of the board, so landing on a puck means the panel
       really moved rather than the target happening to be above the fold */
    await page.evaluate(() => { const b = document.querySelector('#sbBoard') as HTMLElement; b.scrollTop = b.scrollHeight })
    await page.click('#sbWarn .wln[data-wdi]')
    await settleBoth(page, '#sbBoard')

    const m = await page.evaluate(() => {
      const board = document.querySelector('#sbBoard') as HTMLElement
      const puck = document.querySelector('.sb-boardwrap .puck.wfoc') as HTMLElement
      if (!puck) return null
      const b = board.getBoundingClientRect(), p = puck.getBoundingClientRect()
      return { inView: p.top >= b.top - 1 && p.bottom <= b.bottom + 1 }
    })
    expect(m, 'the board lit a puck for the focused warning').not.toBeNull()
    expect(m!.inView, 'the offending puck is inside the board panel').toBe(true)
  })

  test('the edit week: a far-day witem brings its puck fully into view, on both axes', async ({ page }) => {
    await page.setViewportSize(DESK)
    await login(page)
    await go(page, 'editsched')

    /* day 3 (Thursday) carries ILLEGAL_CREW (bapster+badger) in the seed —
       far enough into the week that "in view" actually proves something.
       Both week pages stay mounted (one display:none), so every query below
       is scoped to #eWeek — an unscoped one could grab the hidden #vWeek's
       0x0 twin instead. */
    const di = 3
    await scrollTo(page, '#eWeek', 0)
    await page.click(`#eWeek .day[data-day="${di}"] .daywarn[data-daywarn]`)
    await page.waitForSelector(`#eWeek .day[data-day="${di}"] .witem[data-wdi]`)
    await scrollTo(page, '#eWeek', 0)          // the expand may have nudged it

    await page.click(`#eWeek .day[data-day="${di}"] .witem[data-wdi]`)
    await settleWeek(page, '#eWeek')

    const m = await page.evaluate((d) => {
      const week = document.querySelector('#eWeek') as HTMLElement
      const puck = document.querySelector(`#eWeek .day[data-day="${d}"] .puck.wfoc:not(.echo)`) as HTMLElement
      if (!puck) return null
      const w = week.getBoundingClientRect(), p = puck.getBoundingClientRect()
      return {
        insideX: p.left >= w.left - 1 && p.right <= w.right + 1,
        /* the week test above only checks X — the week scrolls X on ITSELF
           but Y on the PAGE (there is no vertical scroller on #eWeek), so the
           vertical check reads the viewport, not a #eWeek.scrollTop that
           never moves */
        insideY: p.top >= -1 && p.bottom <= window.innerHeight + 1,
      }
    }, di)
    expect(m, 'a focused puck is on the page').not.toBeNull()
    expect(m!.insideX, 'the puck is inside the week horizontally').toBe(true)
    expect(m!.insideY, 'the puck is inside the page viewport vertically').toBe(true)
  })

  test('view schedule: a day-detail warning row brings its puck fully into view, on both axes', async ({ page }) => {
    await page.setViewportSize(DESK)
    await login(page)
    await go(page, 'viewsched')

    const di = await page.evaluate(() => {
      const days = [...document.querySelectorAll('#vWeek .day[data-day]')]
      const hit = days.find(d => d.querySelector('.daywarn[data-daywarn]'))
      return hit ? +(hit as HTMLElement).dataset.day! : -1
    })
    test.skip(di < 0, 'no flagged day in the seed week')

    /* the day-detail (ⓘ) panel is read-only, opened by [data-dayinfo] on
       either surface — the view page has no other way in */
    await page.click(`#vWeek .day[data-day="${di}"] [data-dayinfo]`)
    await page.waitForSelector('#dayPopBody [data-adv]')
    await page.click('#dayPopBody [data-adv]')
    await settleWeek(page, '#vWeek')

    const m = await page.evaluate((d) => {
      const week = document.querySelector('#vWeek') as HTMLElement
      const puck = document.querySelector(`#vWeek .day[data-day="${d}"] .puck.wfoc:not(.echo)`) as HTMLElement
      if (!puck) return null
      const w = week.getBoundingClientRect(), p = puck.getBoundingClientRect()
      return {
        insideX: p.left >= w.left - 1 && p.right <= w.right + 1,
        insideY: p.top >= -1 && p.bottom <= window.innerHeight + 1,
      }
    }, di)
    expect(m, 'a focused puck is on the page').not.toBeNull()
    expect(m!.insideX, 'the puck is inside the week horizontally').toBe(true)
    expect(m!.insideY, 'the puck is inside the page viewport vertically').toBe(true)
  })

  test('a chip click selects like the puck body, and the selection styling is blue-only', async ({ page }) => {
    /* Owner, 7 Aug 26: the chip is no longer a navigation surface — it selects
       the person like the puck around it — and selection is the blue fill
       alone: no pale #BFE0FF halo, the red/amber severity ring still visible
       on a selected puck, everything else at half strength rather than 18%.
       All of that is paint, which is exactly what vitest cannot see (the class
       assertions live in warnjump.test.tsx; the pixels are gated here). */
    await page.setViewportSize(DESK)
    await login(page)
    await go(page, 'viewsched')

    const has = await page.evaluate(() => !!document.querySelector('#vWeek .puck.warn[data-person]:not(.sm) .lchip'))
    test.skip(!has, 'no flagged puck with a chip in the seed week')

    /* :not(.sm) — the 74x15 contract belongs to the wave grid's pucks, not
       the small ones in the programme rows */
    await page.click('#vWeek .puck.warn[data-person]:not(.sm) .lchip')
    await settleWeek(page, '#vWeek')

    const m = await page.evaluate(() => {
      const sel = document.querySelector('#vWeek .puck.sel.warn:not(.sm)') as HTMLElement
      if (!sel) return null
      const cs = getComputedStyle(sel)
      const copies = document.querySelectorAll(`.puck[data-person="${sel.dataset.person}"]`)
      const selCopies = document.querySelectorAll(`.puck.sel[data-person="${sel.dataset.person}"]`)
      const dim = document.querySelector('#vWeek .puck.dim') as HTMLElement
      const r = sel.getBoundingClientRect()
      return {
        wfoc: !!document.querySelector('.puck.wfoc'),
        bg: cs.backgroundColor,
        shadow: cs.boxShadow,
        everyCopy: copies.length === selCopies.length,
        dimOpacity: dim ? getComputedStyle(dim).opacity : null,
        box: { w: Math.round(r.width), h: Math.round(r.height) },
        boxOpen: !!document.querySelector('#vWeek .dwbox.open.pfoc'),
      }
    })
    expect(m, 'the chip click selected a warned puck').not.toBeNull()
    expect(m!.wfoc, 'no warning-focus regime — this is the person view').toBe(false)
    expect(m!.boxOpen, 'his issue box opened, narrowed to him').toBe(true)
    expect(m!.everyCopy, 'every copy of the person is selected').toBe(true)
    expect(m!.bg, 'the selection blue').toBe('rgb(30, 134, 255)')
    /* the severity ring survives selection; the old pale halo is gone */
    expect(m!.shadow, 'no #BFE0FF halo').not.toContain('rgb(191, 224, 255)')
    expect(m!.shadow, 'the warn ring is still drawn').not.toBe('none')
    expect(m!.dimOpacity, 'the rest at half strength, not 18%').toBe('0.5')
    expect(m!.box, 'selection styling must not move the box').toEqual({ w: 74, h: 15 })
  })

  test('selecting a puck holds the screen still while his boxes open', async ({ page }) => {
    /* Owner, 7 Aug 26: "it should just turn blue. it should not pan the view
       at all." The view never scrolled — but his issue box opens ABOVE the
       schedule inside the day column, so the very puck just clicked leapt
       ~220px down the page, which reads exactly like a pan. interactions.ts
       now scrolls the page by the puck's own displacement one macrotask after
       the render, so it stays put under the pointer. jsdom reports every rect
       at 0×0 — a zero delta by construction — so only this test can see the
       hold, which is how the jump shipped unnoticed in the first place. */
    await page.setViewportSize(DESK)
    await login(page)
    await go(page, 'viewsched')

    /* a person flagged on the day of his own first puck, so a box really
       opens above the puck being measured — found from the DOM, not assumed */
    const sel = '#vWeek .puck[data-person="bane"]'
    const before = await page.evaluate((s) => {
      const pk = document.querySelector(s) as HTMLElement
      return pk ? { top: pk.getBoundingClientRect().top } : null
    }, sel)
    test.skip(!before, 'no bane puck in the seed week')

    /* EVERY FRAME, not just the end state (owner, 7 Aug 26: "the page
       jitters"). The first hold corrected on a setTimeout — after the browser
       had painted the shifted layout — so the end position measured perfect
       while one painted frame showed a ~220px leap-and-snap. rAF fires before
       each paint: sample the puck's viewport top on every frame across the
       click, and no sample may deviate.
       CPU-throttled, because the race is machine-dependent: on a fast
       headless box the timeout used to win against the next frame and the
       buggy code measured clean — which is exactly how it shipped. The fixed
       path is a single synchronous task, so no throttle can break it. */
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 8 })
    await page.evaluate((s) => {
      const w = window as any
      w.__tops = []
      const tick = () => {
        const pk = document.querySelector(s) as HTMLElement
        if (pk) w.__tops.push(pk.getBoundingClientRect().top)
        if (w.__tops.length < 90) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, sel)

    /* clickHere, not page.click: an actionable click scrolls the target into
       view first, which would contaminate the very measurement under test */
    expect(await clickHere(page, sel)).toBe(true)
    await page.waitForTimeout(500)

    const after = await page.evaluate((s) => {
      const pk = document.querySelector(s) as HTMLElement
      return {
        top: pk.getBoundingClientRect().top,
        sel: pk.classList.contains('sel'),
        boxes: document.querySelectorAll('#vWeek .dwbox.open').length,
        tops: (window as any).__tops as number[],
      }
    }, sel)
    expect(after.sel, 'the click selected him').toBe(true)
    expect(after.boxes, 'his issue boxes still open').toBeGreaterThan(0)
    expect(Math.abs(after.top - before!.top),
      'and the puck never moved under the pointer').toBeLessThanOrEqual(1.5)
    const worst = Math.max(...after.tops.map(t => Math.abs(t - before!.top)))
    expect(worst, 'no single frame painted him anywhere else — no jitter')
      .toBeLessThanOrEqual(1.5)
  })

  test('a SIM_BRIEF warning pans to the sim row that briefs, and it lands on screen', async ({ page }) => {
    await page.setViewportSize(DESK)
    await login(page)
    await go(page, 'viewsched')

    /* warnings carry the causing line's slot-key (w.key); jsdom pins WHICH
       element the scroll aims at, but only a browser can verify the anchored
       ROW — not merely some copy of the flagged name — ends up in view */
    const hit = await page.evaluate(() => {
      const W = (window as any).WARN
      for (const g of W.byDay) for (let ix = 0; ix < ((g && g.warns) || []).length; ix++) {
        const w = g.warns[ix]
        if (w.code === 'SIM_BRIEF' && w.key) return { di: g.di, ix, key: w.key }
      }
      return null
    })
    test.skip(!hit, 'no SIM_BRIEF in the seed week')

    /* Park the week where this day is genuinely off screen, whichever side
       that is — the leftmost position when the day is late in the week, the
       far right when it is early. The pan is conditional now (it holds the
       lateral view for a target already visible), and this test is about the
       PAN: it asserts the whole anchored row lands inside the week, which is a
       stronger claim than "the puck is visible" and only the pan delivers it. */
    const park = async () => page.evaluate(async (d) => {
      const week = document.querySelector('#vWeek') as HTMLElement
      const off = () => {
        const day = document.querySelector(`#vWeek .day[data-day="${d}"]`) as HTMLElement
        const w = week.getBoundingClientRect(), r = day.getBoundingClientRect()
        return r.right <= w.left || r.left >= w.right
      }
      for (const x of [0, week.scrollWidth]) {
        week.scrollTo({ left: x, behavior: 'instant' as ScrollBehavior })
        await new Promise(r => requestAnimationFrame(() => r(null)))
        if (off()) return true
      }
      return off()
    }, hit!.di)

    await scrollTo(page, '#vWeek', 0)
    await page.click(`#vWeek .day[data-day="${hit!.di}"] .daywarn[data-daywarn]`)
    await page.waitForSelector(`#vWeek .day[data-day="${hit!.di}"] .dwlist .witem[data-wix="${hit!.ix}"]`)
    const parked = await park()                // the expand may have nudged it
    await settle(page, '#vWeek')
    test.skip(!parked, 'the week is too short to park this day off screen')

    expect(await clickHere(page, `#vWeek .day[data-day="${hit!.di}"] .dwlist .witem[data-wix="${hit!.ix}"]`)).toBe(true)
    /* settleWeek, not settleBoth: the week scrolls X on itself but Y on the
       PAGE, so watching #vWeek.scrollTop returns before the vertical settles */
    await settleWeek(page, '#vWeek')

    const m = await page.evaluate(({ di, key }) => {
      const week = document.querySelector('#vWeek') as HTMLElement
      const day = document.querySelector(`#vWeek .day[data-day="${di}"]`) as HTMLElement
      /* the anchored sim row: the .pl-row holding a slot under the warning's key */
      const seat = [...day.querySelectorAll('[data-slot],[data-fill]')].find(el => {
        const k = (el as HTMLElement).dataset.slot || (el as HTMLElement).dataset.fill
        return k === key || (k != null && k.indexOf(key + '.') === 0)
      })
      const row = seat && (seat.closest('.pl-row') as HTMLElement)
      if (!row) return null
      const w = week.getBoundingClientRect(), r = row.getBoundingClientRect()
      return {
        insideX: r.left >= w.left - 1 && r.right <= w.right + 1,
        insideY: r.top >= -1 && r.bottom <= window.innerHeight + 1,
        /* the destination really is IN the sim row — the flagged person's own
           puck there carries the focus paint */
        lit: !!row.querySelector('.puck.wfoc'),
      }
    }, hit!)
    expect(m, 'the day renders the anchored sim row').not.toBeNull()
    expect(m!.lit, 'the focused puck sits inside the anchored sim row').toBe(true)
    expect(m!.insideX, 'the sim row is inside the week horizontally').toBe(true)
    expect(m!.insideY, 'the sim row is inside the page viewport vertically').toBe(true)
  })

  test('the board at a small viewport scrolls to the deepest warning\'s puck', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 600 })
    await login(page)
    await go(page, 'editsched')

    const di = await page.evaluate(() => {
      const days = [...document.querySelectorAll('#eWeek .day[data-day]')]
      const hit = days.find(d => d.querySelector('.daywarn[data-daywarn]'))
      return hit ? +(hit as HTMLElement).dataset.day! : -1
    })
    test.skip(di < 0, 'no flagged day in the seed week')

    await page.evaluate((d) => (window as any).openScheduler(d), di)
    await page.waitForSelector('#sbWarn .wln[data-wix]')

    /* "deepest" = the row whose target puck sits furthest down #sbBoard's OWN
       content, not whichever the list happens to render first — that is the
       one that actually needs the panel to scroll to reach it. A crew warning
       paints .wfoc on every copy of both names, so the rank picks by the
       FURTHEST candidate rather than assuming there is exactly one. */
    const wix = await page.evaluate(() => {
      const board = document.querySelector('#sbBoard') as HTMLElement
      const W = (window as any).WARN
      const rows = [...document.querySelectorAll('#sbWarn .wln[data-wix]')] as HTMLElement[]
      let best = -1, bestTop = -Infinity
      rows.forEach((r, i) => {
        const w = W.byDay[+r.dataset.wdi!].warns[+r.dataset.wix!]
        const ids: string[] = w.who || []
        const tops = [...board.querySelectorAll('.puck[data-person]')]
          .filter(p => ids.includes((p as HTMLElement).dataset.person!))
          .map(p => (p as HTMLElement).getBoundingClientRect().top)
        if (!tops.length) return
        const top = Math.max(...tops)
        if (top > bestTop) { bestTop = top; best = i }
      })
      return best
    })
    expect(wix, 'at least one warning on the board names a puck').toBeGreaterThan(-1)

    await page.locator('#sbWarn .wln[data-wix]').nth(wix).click()
    await settleBoth(page, '#sbBoard')

    const m = await page.evaluate(() => {
      const board = document.querySelector('#sbBoard') as HTMLElement
      const puck = document.querySelector('.sb-boardwrap .puck.wfoc') as HTMLElement
      if (!puck) return null
      const b = board.getBoundingClientRect(), p = puck.getBoundingClientRect()
      return { inView: p.top >= b.top - 1 && p.bottom <= b.bottom + 1 }
    })
    expect(m, 'the board lit a puck for the focused warning').not.toBeNull()
    expect(m!.inView, 'the deepest warning\'s puck is inside the board panel').toBe(true)
  })
})

/* STORES CONFIGURATION — the four things vitest structurally cannot see
   (Task 8). Every rect vitest reports is 0x0, so it can confirm which
   classes were emitted and nothing about where anything sits. The four
   below are the brief's, checked against the real built DOM — the brief
   was written before the feature existed and named a couple of selectors
   that never shipped (`.sb-open[data-sbday]` doesn't carry a data-sbday
   attribute; the board's chip is `.stchip[data-store]`, not `[data-store$=]`
   read off a synthetic key the way the brief assumed) — corrected below
   against `git show ef0e83b/243d75b/adf3f15` and the live markup, not
   transcribed. Three more follow: real regressions hand-fixed during this
   build, none of which had a standing guard before this file. */

test('board: the flying line keeps its grid-item count with stores present', async ({ page }) => {
  await login(page); await go(page, 'editsched')
  await page.click('.sb-open')
  /* $eval reads once, immediately — it does not auto-wait the way a
     locator does, so a bare click-then-$eval can race the board's own
     imperative paint (SchedBoard's effect sets the panel's innerHTML AFTER
     mount, not synchronously with the click). Wait for the line to actually
     be there first, same convention every other board test in this file
     already uses before reading geometry off it (see the phone duty-row
     test above and the .sb-wide combos below).
     `:first-of-type` (as the brief wrote it) never matches ANY .sb-line: a
     wave's DOM order is .sb-go-h, .sb-lcols, then the .sb-line rows, all
     four are <div>s, and :first-of-type means "the first sibling of this
     TAG", not "the first sibling matching this selector" — so .sb-go-h,
     the actual first div, wins that title every time and no .sb-line is
     ever its own type's first child. Plain first-in-document-order (what
     $eval already reads — the first match, not a collection) is what the
     test needs. */
  await page.waitForSelector('#schedBoard .sb-line')
  const n = await page.$eval('#schedBoard .sb-line', el => el.children.length)
  /* ten, not nine, since the reorder grip landed (8 Aug 26): the grip is
     .sb-line's first child on every viewport — display:none on a phone
     hides it from layout, not from the DOM — so the count this test pins
     went from nine to ten everywhere, not just on desktop. */
  expect(n, 'ten grid items — the grip plus the original nine, .sb-rcell still exactly one').toBe(10)
})

test('board at 390px: the remarks cell drops to its own full-width strip', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 })
  await login(page); await go(page, 'editsched')
  await page.click('.sb-open')
  const line = await page.locator('#schedBoard .sb-line').first().boundingBox()
  const cell = await page.locator('#schedBoard .sb-line .sb-rcell').first().boundingBox()
  expect(cell!.width, 'full width, like .nts was').toBeGreaterThan(line!.width - 30)
  const cfg = await page.locator('#schedBoard .sb-line .stcfg').first().boundingBox()
  /* NOT the same failure shape as .sb-arow.c6r's ITEM column: that input
     lived in a grid track fighting a competing template and could be
     squeezed toward zero by it. .stcfg's size is intrinsic — a single
     character at font-size:8px, padding:1px 4px, a 1px border, no grid
     track to lose — and measures the SAME ~15.8px at 390px and at 1400px,
     board and week alike (checked against the live build before setting
     this number). A floor near "comfortably tappable" (24-30px) would
     fail this assertion against the correct, unregressed build, since the
     button was never that size to begin with; a floor of 12 still rules
     out what this check exists to catch — collapsed to 0, or hidden. */
  expect(cfg!.width, 'C is reachable, not collapsed to a stub').toBeGreaterThan(12)
})

/* THE BOARD'S CREW STACKS IN PAIRS ON A PHONE (owner, 8 Aug 26). Monday's
   AMT BOX carries eight pax; the phone board's People cell used to let them
   flex-wrap four abreast, reading as two unrelated ranks of names where the
   week shows the same row as vertical pairs (FCP beside RCP, four rows).
   The cell is capped at two pucks wide in the phone stack, so any row's
   crew wraps into the week's pair geometry; .sb-wide (the desktop layout)
   keeps its wide cell. CSS-only, which is exactly why it needs a browser:
   jsdom would report every one of these rects at 0x0. */
test('board at 390px: an eight-pax sim row stacks its pucks two per row', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 })
  await login(page); await go(page, 'editsched')
  await page.click('.sb-open')
  const tops = await page.$$eval('#schedBoard .sb-panel.simr .sb-arow .ppl', cells => {
    const big = cells.find(c => c.querySelectorAll('.puck').length === 8)!
    return [...big.querySelectorAll('.puck')].map(p => Math.round(p.getBoundingClientRect().top))
  })
  expect(tops.length, 'the seed AMT BOX row with its eight pax').toBe(8)
  const rows = new Map<number, number>()
  tops.forEach(t => rows.set(t, (rows.get(t) || 0) + 1))
  expect(Math.max(...rows.values()), 'no visual row holds more than a pair').toBeLessThanOrEqual(2)
  expect(rows.size, 'eight pax = four pair-rows').toBe(4)
})

/* THE SEATS SAT IN THE TIME TRACKS AND OVERLAPPED (owner, from the deployed
   site, 8 Aug 26). Grid auto-flow is sequential: when the full-width B cell
   (child 3) broke to its own row, TO/LD slid into the 54/60px name tracks
   and the two 74px seats into the 46px time tracks — pucks painting over
   each other and over the "+ RCP" dashed box. The B cell is pinned to row 2
   now and each seat takes a full-width strip. Only a browser can see any of
   this — the class list never changed. */
test('board at 390px: the seats sit clear of the time boxes and of each other', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 })
  await login(page); await go(page, 'editsched')
  await page.click('.sb-open')
  const geo = await page.evaluate(() => {
    const hit = (a: DOMRect, b: DOMRect) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
    const bad: string[] = []
    document.querySelectorAll('#sbBoard .sb-line').forEach((line, li) => {
      const slots = [...line.querySelectorAll('.sb-slot')].map(s => s.getBoundingClientRect())
      const inputs = [...line.querySelectorAll('input')].map(i => i.getBoundingClientRect())
      if (slots.length === 2 && hit(slots[0]!, slots[1]!)) bad.push(`line ${li}: seats overlap`)
      slots.forEach((s, si) => inputs.forEach(r => { if (hit(s, r)) bad.push(`line ${li} slot ${si}: overlaps an input`) }))
    })
    return bad
  })
  expect(geo, 'no seat overlaps a seat or an input on any line').toEqual([])
})

/* A DELETED PAX LEAVES ITS SLOT ON SCREEN (owner, 8 Aug 26). The engine
   always held the hole; the board rendered it as nothing, so the block
   collapsed upward and the replacement had nowhere to land. jsdom pins the
   markup (board.test.tsx); this measures the hole really occupying the
   deleted seat's place — same pair-row as its neighbour, right beside it. */
test('board at 390px: a deleted AMT pax leaves a droppable hole in its own place', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 })
  await login(page); await go(page, 'editsched')
  await page.click('.sb-open')
  await page.evaluate(() => { (window as any).setSlotVal('s:0.amt.1.pax.1', ''); (window as any).afterSchedMutate() })
  const hole = await page.evaluate(() => {
    const el = document.querySelector('#sbBoard .sb-slot.empty.pax') as HTMLElement
    if (!el) return null
    const r = el.getBoundingClientRect()
    const first = [...document.querySelectorAll('#sbBoard .sb-panel.simr .seat[data-slot="s:0.amt.1.pax.0"] .puck')][0]!.getBoundingClientRect()
    return { key: el.dataset.slot, sameRow: Math.abs(r.top - first.top) < 3, besideIt: r.left > first.right, w: Math.round(r.width) }
  })
  expect(hole, 'the hole rendered').toBeTruthy()
  expect(hole!.key).toBe('s:0.amt.1.pax.1')
  expect(hole!.sameRow, 'the hole keeps the deleted seat\'s pair-row').toBe(true)
  expect(hole!.besideIt, 'sitting beside its neighbour, not collapsed away').toBe(true)
  expect(hole!.w, 'puck-sized, so the pair rows stay level').toBeGreaterThanOrEqual(74)
})

/* THE PARKED TAB STOLE TAPS (owner critique, 8 Aug 26). The drawer aside
   spanned top:0-bottom:0, so its parked sliver covered the header's right
   edge — elementFromPoint at the centre of ✕ Close and of the Sun 19 chip
   returned .ros-tab, and both taps opened the drawer. The invisible 14px
   ::before extension likewise sat over the last ~13px of every full-width
   input. The drawer is a centred grab-handle now, and nothing invisible
   extends past it. */
test('board at 390px: taps near the right edge land where they aim', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 })
  await login(page); await go(page, 'editsched')
  await page.click('.sb-open')
  /* elementFromPoint only sees the viewport — bring a flying line's remarks
     input on screen first (the header stays pinned above the scroller) */
  await page.locator('#sbBoard .sb-line .nts').first().scrollIntoViewIfNeeded()
  const hits = await page.evaluate(() => {
    const at = (sel: string) => {
      const r = document.querySelector(sel)!.getBoundingClientRect()
      const el = document.elementFromPoint(Math.min(386, r.right - 4), r.top + r.height / 2)
      return el ? ((el as HTMLElement).id || el.className || el.tagName).toString() : 'nothing'
    }
    return { close: at('#sbClose'), sun: at('#sbDays [data-sbtab="6"]'), rmk: at('#sbBoard .sb-line .nts') }
  })
  expect(hits.close, 'the Close button owns its own pixels').toBe('sbClose')
  expect(hits.sun, 'the Sunday chip owns its pixels').toContain('sbday')
  expect(hits.rmk, 'a remarks input owns its right end').toContain('nts')
  const band = await page.locator('#schedBoard .sb-ros').boundingBox()
  expect(band!.height, 'a handle, not a full-height wall').toBeLessThan(500)
  expect(band!.y, 'clear of the header above it').toBeGreaterThan(100)
})

/* THE FOLD AND THE PARK, MEASURED (owner, 8 Aug 26). jsdom pins the class
   machine (board.test.tsx); only a browser can show the rows actually
   hidden, the list actually expanding, and the planted puck actually
   visible once the drawer parks itself. */
test('board at 390px: Live checks folds to one line, and a fill parks the drawer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 })
  await login(page); await go(page, 'editsched')
  await page.click('.sb-open')
  const rowVisible = () => page.locator('#sbWarn .wln[data-wdi]').first().isVisible()
  expect(await rowVisible(), 'collapsed by default — one line, no list').toBe(false)
  await page.click('#sbWarn [data-sbwtog]')
  expect(await rowVisible(), 'the header opens the full list').toBe(true)
  await page.click('#sbWarn [data-sbwtog]')
  expect(await rowVisible(), 'and folds it away again').toBe(false)
  await page.evaluate(() => { (window as any).setSlotVal('s:0.amt.1.pax.1', ''); (window as any).afterSchedMutate() })
  const hole = page.locator('#sbBoard .sb-slot.empty.pax').first()
  await hole.scrollIntoViewIfNeeded(); await hole.click({ position: { x: 20, y: 5 } })
  await page.waitForTimeout(300)
  await page.locator('#schedBoard .sb-roster .rpuck', { hasText: 'Drill' }).first().click()
  await page.waitForTimeout(350)
  const after = await page.evaluate(() => {
    const s = document.querySelector('#sbBoard .seat[data-slot="s:0.amt.1.pax.1"]')
    const r = s && s.getBoundingClientRect()
    return { parked: !document.body.classList.contains('ros-open'),
             seatVisible: !!r && r.left >= 0 && r.right <= 390 && r.top > 0 && r.bottom < 780 }
  })
  expect(after.parked, 'the drawer parked itself on the fill').toBe(true)
  expect(after.seatVisible, 'and the planted puck is on screen').toBe(true)
})

/* THE PHONE BOARD IS ONE WINDOW (owner, 8 Aug 26 — comp approved before
   build). It used to be three stacked zones: panels, then a bottom-pinned
   Live-checks + roster sheet, split by a resize grip. Now it matches the
   edit week: the warnings strip rides at the top of the one scroller, the
   roster parks in a right-edge AIRCREW drawer that slides over the board,
   and arming a slot pulls the drawer open by itself (the week's own
   gesture). All geometry — jsdom can pin the classes (odds.test.tsx) but
   not that anything actually sits, slides or stays on screen. */
test('the phone board is one window: warnings on top, aircrew in an edge drawer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 })
  await login(page); await go(page, 'editsched')
  await page.click('.sb-open')
  /* the strip opens FOLDED since the same-day critique (its rows hide until
     the header is tapped — pinned both ways by the fold test), so the
     on-top contract is asserted on the header line */
  await expect(page.locator('#schedBoard .sb-warn .wh').first()).toBeVisible()
  const warn = await page.locator('#schedBoard .sb-warn').boundingBox()
  const panel = await page.locator('#sbBoard .sb-panel').first().boundingBox()
  expect(warn!.y, 'live checks ride above the first panel').toBeLessThan(panel!.y)
  expect(await page.locator('#sbGrip').count(), 'the resize grip is gone').toBe(0)
  const parked = await page.locator('#schedBoard .sb-ros').boundingBox()
  expect(parked!.x, 'drawer parked: only the 30px handle on screen').toBeGreaterThanOrEqual(358)
  const tab = await page.locator('#schedBoard .sb-ros .ros-tab').boundingBox()
  expect(tab!.x + tab!.width, 'the tab sits flush with the right edge').toBeGreaterThan(388)
  await page.click('#schedBoard .sb-ros .ros-tab')
  await page.waitForTimeout(300)                       // the .2s slide
  const slid = await page.locator('#schedBoard .sb-ros').boundingBox()
  expect(slid!.x, 'drawer open: the palette slides over the board').toBeLessThan(390 - 100)
  await expect(page.locator('#schedBoard .sb-roster .rpuck').first()).toBeVisible()
  await page.click('#schedBoard .sb-ros .ros-tab')     // park it again
  await page.waitForTimeout(300)
  /* Monday's seed has every seat crewed, so arm through a People cell's
     append target — the same boardArmClick path a slot takes */
  await page.locator('#sbBoard .ppl[data-fill]').first().click()   // arm a slot…
  await expect(page.locator('body'), '…and the drawer opens itself, like the week').toHaveClass(/ros-open/)
})

test('the pen reorders, and the popup survives a click into a rename field', async ({ page }) => {
  await login(page); await go(page, 'editsched')
  await clickHere(page, '#eWeek .stcfg[data-stcfg]')
  await page.click('.stmenu .st-pen')
  await page.click('.stmenu .st-erow[data-k="tk2"] .st-lab')
  await expect(page.locator('.stmenu'), 'an in-box click must not dismiss it').toBeVisible()
  const first = () => page.locator('.stmenu .st-erow').first().getAttribute('data-k')
  expect(await first()).toBe('tpod')
  await page.click('.stmenu .st-erow[data-k="tk2"] .st-up')
  expect(await first(), 'the up arrow really reorders').toBe('tk2')
})

/* PINCH-ZOOM PLACEMENT (owner, from the deployed site, 8 Aug 26). On a phone
   the C button is small enough that the natural gesture is pinch in, press it
   — and the popup used to place itself in layout-viewport coordinates, which
   with the pinch on usually means the part of the page the zoom pushed off
   screen: the user had to zoom back out and go hunting for the box they just
   asked for. place() centres it in the VISUAL viewport instead when a real
   pinch is on, capped to fit (the .wavemenu min-width would otherwise hold it
   wider than the visible slice — measured before the inline zero). Only a
   real browser can gate this: jsdom reports every rect 0x0, so place() bails
   before the branch is even reached. */
test('the stores popup opens inside the visible slice when the page is pinch-zoomed', async ({ page }) => {
  await page.setViewportSize(PHONE)
  await login(page); await go(page, 'editsched')
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2.5 })
  /* element.click(), not page.click: Playwright's pointer maths and the CDP
     pinch emulation disagree about coordinates, and the button is what the
     user pressed either way — the placement is what's under test here */
  await page.evaluate(() => (document.querySelector('#eWeek .stcfg[data-stcfg]') as HTMLElement).click())
  const fit = await page.evaluate(() => {
    const b = document.querySelector('.stmenu')!.getBoundingClientRect(), vv = window.visualViewport!
    return { scale: vv.scale,
             l: b.left - vv.offsetLeft, t: b.top - vv.offsetTop,
             r: vv.offsetLeft + vv.width - b.right, b2: vv.offsetTop + vv.height - b.bottom }
  })
  expect(fit.scale, 'the pinch emulation really took').toBeGreaterThan(2)
  for (const edge of ['l', 't', 'r', 'b2'] as const)
    expect(fit[edge], `the box sits inside the visual viewport (${edge} edge)`).toBeGreaterThanOrEqual(0)
})

test('a renamed store keeps its chip on every jet that carries it', async ({ page }) => {
  await login(page); await go(page, 'editsched')
  await clickHere(page, '#eWeek .stcfg[data-stcfg]')
  await page.click('.stmenu .st-pen')
  await page.fill('.stmenu .st-erow[data-k="tk2"] .st-lab', '2 TANKS')
  await page.locator('.stmenu .st-erow[data-k="tk2"] .st-lab').blur()
  await page.keyboard.press('Escape')
  const chip = page.locator('#eWeek .stchip[data-store$=".tk2"]').first()
  await expect(chip, 'the key survived the rename').toBeVisible()
  await expect(chip).toHaveText('2 TANKS')
})

/* THE POPUP MUST TRACK ITS ANCHOR (regression — ef0e83b, 7 Aug 26). The box
   is positioned against the C button, and C sits inside .stores, which is
   inline-flex;wrap — every toggle's notify() rebuilds the remarks cell and
   can shift or wrap the button before it repaints. The bug: place() ran
   once at open and never again, so the box stayed at its opening x while
   the button visibly walked away underneath it. Measured live, before the
   fix: the button moved 435 -> 467 -> 495 -> 455 across three toggles while
   the box sat fixed at 435 the whole time (see the commit message this
   pins). Three toggles, not one — a single toggle can accidentally land the
   button back near its start and hide a still-broken tracker. */
test('the stores popup tracks the live C button across a multi-toggle visit', async ({ page }) => {
  await login(page); await go(page, 'editsched')
  await clickHere(page, '#eWeek .stcfg[data-stcfg]')
  await expect(page.locator('.stmenu')).toBeVisible()
  const toggles = page.locator('.stmenu .wm[data-cfg]')
  expect(await toggles.count(), 'the popup lists stores to toggle').toBeGreaterThanOrEqual(3)

  const btnLeft = () => page.evaluate(() =>
    Math.round(document.querySelector('[data-stcfg]')!.getBoundingClientRect().left))

  const seenButtonLefts: number[] = [await btnLeft()]
  for (let i = 0; i < 3; i++) {
    const before = seenButtonLefts[seenButtonLefts.length - 1]!
    await toggles.nth(i).click()
    /* Wait on something measurable, not a guessed sleep. Each of these
       three toggles turns a DIFFERENT store on — [0], [1], [2] in the
       popup's list — so the chip row strictly grows each time and the
       button's own x, being a function of the chips before it in the
       inline-flex row, is expected to change on every iteration. Poll for
       that actually happening rather than assuming a fixed delay covers
       it: on a slow run, a bare sleep can expire before the repaint lands,
       and both readings would then reflect the PREVIOUS toggle's already-
       correct position — passing without having exercised anything. If
       the button genuinely never moves this poll times out and the test
       fails loudly, which is the right outcome for a claim that no longer
       holds, not a silently-widened tolerance. */
    await expect.poll(btnLeft, `toggle ${i + 1}: the button actually repainted before this reading`)
      .not.toBe(before)
    const after = await btnLeft()
    const box = await page.locator('.stmenu').boundingBox()
    seenButtonLefts.push(after)
    expect(Math.abs(after - box!.x), `toggle ${i + 1}: the box is anchored to the live button, not a stale one`)
      .toBeLessThanOrEqual(3)
  }
  /* belt-and-braces: the per-toggle poll above already proves each step
     differs from the one before it, so this is now guaranteed by
     construction rather than a separate guard against a vacuous pass —
     kept as a plain sanity check on the whole run. */
  expect(new Set(seenButtonLefts).size, 'the button really did move across the three toggles').toBeGreaterThan(1)
})

/* THE POPUP MUST ANCHOR TO THE SURFACE ITS OWN BUTTON WAS PRESSED ON
   (regression — final review, 8 Aug 26). `#eWeek` and `#schedBoard` both
   render `data-stcfg="0.0.0.0"` for the same jet while the board is open
   over the week, and `<Shell/>` (the week) precedes `<SchedBoard/>` in
   App.tsx — so an unscoped `document.querySelector('[data-stcfg="..."]')`
   in openStoresMenu's place() always found the WEEK's button, even for a
   popup opened from the board. Measured on the built app before the fix:
   board button at x=731,y=275; the popup that opened from it landed at
   x=435,y=594 — the week's button position, ~300px away and ~320px below
   the control actually pressed, floating over unrelated board content.
   Wrong from the very first paint, not just on re-placement — every other
   popup test in this file opens from `#eWeek`, which is exactly why this
   one shipped unguarded. */
test('the stores popup opened from the BOARD anchors to the board\'s own C button, not the week\'s', async ({ page }) => {
  /* tall on purpose: the board panel and its C button routinely sit below
     a normal 720px fold (measured live: ~900px down the page), and
     place()'s own viewport clamp (`Math.min(window.innerHeight -
     box.offsetHeight - 8, r.bottom + 6)`) would then pull the popup up to
     fit — a real, separate, and correct behaviour that has nothing to do
     with which button it anchored to, and would otherwise swamp the
     x/y distances this test actually cares about. Tall enough that
     `r.bottom + 6` never hits that clamp, so a passing popup position
     here can only be explained by the anchor fix, not by the clamp
     coincidentally landing in the right place. */
  await page.setViewportSize({ width: 1500, height: 1400 })
  await login(page); await go(page, 'editsched')
  await page.click('.sb-open')
  await page.waitForSelector('#schedBoard .sb-line .stcfg[data-stcfg]')

  const weekBtn = page.locator('#eWeek .stcfg[data-stcfg]').first()
  const boardBtn = page.locator('#schedBoard .sb-line .stcfg[data-stcfg]').first()
  await expect(weekBtn, 'the week\'s own C button sits underneath the open board').toBeVisible()
  /* both surfaces render the SAME jet's key while the board is open — the
     exact precondition the bug needed */
  expect(await boardBtn.getAttribute('data-stcfg')).toBe(await weekBtn.getAttribute('data-stcfg'))

  const weekBox = (await weekBtn.boundingBox())!
  const boardBox = (await boardBtn.boundingBox())!
  /* sanity: the two buttons have to actually be far apart for the
     assertions below to mean anything — if they ever coincided, landing
     "near the board button" would also mean landing near the week's, and
     this test would pass whether or not the fix is in place */
  expect(Math.hypot(boardBox.x - weekBox.x, boardBox.y - weekBox.y),
    'sanity: the week and board C buttons are not coincidentally co-located').toBeGreaterThan(100)

  await clickHere(page, '#schedBoard .sb-line .stcfg[data-stcfg]')
  await expect(page.locator('.stmenu')).toBeVisible()
  const popup = (await page.locator('.stmenu').boundingBox())!

  const dBoard = Math.hypot(popup.x - boardBox.x, popup.y - boardBox.y)
  const dWeek = Math.hypot(popup.x - weekBox.x, popup.y - weekBox.y)
  expect(dBoard, 'the popup lands beside the BOARD button that was actually clicked').toBeLessThan(80)
  expect(dWeek, 'not beside the week\'s button underneath it').toBeGreaterThan(dBoard)
})

/* THE FIRST CLICK AFTER A RENAME MUST NOT BE SWALLOWED (regression —
   cbc0e87/243d75b, 7 Aug 26). A <button> takes focus on mousedown in
   Chromium, before mouseup — so typing a rename and then clicking a control
   on a DIFFERENT row fires the input's 'change' (blur, ahead of the click)
   synchronously inside that same mousedown. The original bug repainted the
   box from that handler, detaching the very button the mousedown had just
   landed on; the mouseup that followed landed on nothing, and the click was
   silently dropped — a scheduler had to click twice. Real keyboard input is
   the point: `fill` plus a real `click`, not a synthetic 'change' dispatched
   as its own already-committed step — that is exactly how the bug shipped
   past the first round of tests once already. */
test('typing a rename then clicking a different row\'s control does not eat the first click', async ({ page }) => {
  await login(page); await go(page, 'editsched')
  await clickHere(page, '#eWeek .stcfg[data-stcfg]')
  await page.click('.stmenu .st-pen')
  await page.waitForSelector('.stmenu .st-erow')

  await page.fill('.stmenu .st-erow[data-k="tk2"] .st-lab', '2 TANKS WIDE LABEL')
  /* one real click, on a DIFFERENT row's delete — the blur/change from the
     field above fires first, synchronously, inside this same mousedown */
  await page.click('.stmenu .st-erow[data-k="nc"] .st-del')

  const keys = await page.locator('.stmenu .st-erow').evaluateAll(els => els.map(e => (e as HTMLElement).getAttribute('data-k')))
  expect(keys, 'the delete landed on the first click — nc is really gone').not.toContain('nc')
})

/* THE BOARD'S FLYING LINE IN .sb-wide AT PHONE WIDTH (regression — fc62e05,
   7 Aug 26). scheduler.css's .sb-wide reset still named .sb-line .nts, which
   stopped being a grid item once .nts moved inside .sb-rcell — so .sb-rcell
   kept the phone stylesheet's grid-column:1/-1 even inside .sb-wide's
   nine-column desktop template, and "Desktop layout" on a phone turned
   every flying line from one row into three (measured live: 36px -> 111px).
   Checked across all four combinations a scheduler can actually reach:
   1400px normal and 1400px .sb-wide are both outside the phone media query
   and were never at risk; 390px stacked is the DELIBERATE phone layout
   (scheduler.css's own comment: B and the remarks cell drop to their own
   full-width strip on purpose, because there is no room for a 9th column) —
   asserting it single-row would be asserting against a documented, reviewed
   design choice, not a bug. 390px .sb-wide is the one combination that
   shipped broken, and is the only one of the four the grid-child count
   alone could not have caught: it stayed 9 in every combination, bug or no
   bug — "three of four passing" is what let it through. (8 Aug 26: the
   count pinned below is now 10, not 9 — the reorder grip added a tenth
   DOM child that is present at every width, hidden only by CSS on a
   phone; the four-combo logic above is otherwise unchanged.) */
test('the board\'s flying line is single-row in .sb-wide at phone width, and stays 10 grid items throughout', async ({ page }) => {
  const combos = [
    { width: 1400, height: 950, wide: false, label: '1400px normal', singleRow: true },
    { width: 1400, height: 950, wide: true, label: '1400px .sb-wide', singleRow: true },
    { width: 390, height: 844, wide: false, label: '390px stacked', singleRow: false },
    { width: 390, height: 844, wide: true, label: '390px .sb-wide', singleRow: true },
  ] as const

  for (const c of combos) {
    await page.setViewportSize({ width: c.width, height: c.height })
    await login(page); await go(page, 'editsched')
    await page.click('.sb-open')
    await page.waitForSelector('#schedBoard .sb-line')
    if (c.wide) {
      await clickHere(page, '#sbWide')
      await page.waitForSelector('#schedBoard.sb-wide')
    }
    const m = await page.evaluate(() => {
      const line = document.querySelector('#schedBoard .sb-line') as HTMLElement
      return { children: line.children.length, height: Math.round(line.getBoundingClientRect().height) }
    })
    expect(m.children, `${c.label}: ten grid items — the grip plus .sb-rcell still exactly one`).toBe(10)
    if (c.singleRow) {
      expect(m.height, `${c.label}: single row, not exploded into three`).toBeLessThan(90)
    } else {
      /* the deliberate phone-stacked layout — pinned as multi-row on
         purpose, so a future change can't collapse it to single-row and
         quietly break the mobile reading order without anyone noticing */
      expect(m.height, `${c.label}: the deliberate mobile stack, not collapsed to one row`).toBeGreaterThan(90)
    }
  }
})

test('the grip shows on desktop and the nudge buttons on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await login(page); await go(page, 'editsched')
  await page.evaluate(() => (window as any).openScheduler(0))
  await page.waitForSelector('#sbBoard .sb-line[data-move]')
  const wide = await page.evaluate(() => {
    const g = document.querySelector('#sbBoard .sb-line .sb-grip') as HTMLElement
    const n = document.querySelector('#sbBoard .sb-line .mbtn.nudge') as HTMLElement
    return { grip: getComputedStyle(g).display, nudge: getComputedStyle(n).display, w: g.getBoundingClientRect().width }
  })
  expect(wide.grip).not.toBe('none')
  expect(wide.nudge).toBe('none')
  expect(Math.round(wide.w)).toBe(18)

  await page.setViewportSize({ width: 390, height: 780 })
  const narrow = await page.evaluate(() => {
    const g = document.querySelector('#sbBoard .sb-line .sb-grip') as HTMLElement
    const n = document.querySelector('#sbBoard .sb-line .mbtn.nudge') as HTMLElement
    return { grip: getComputedStyle(g).display, nudge: getComputedStyle(n).display }
  })
  expect(narrow.grip).toBe('none')
  expect(narrow.nudge).not.toBe('none')
})

/* the nth-child re-index is the breakage-prone half of this change and jsdom
   cannot see it: the phone board must keep the SAME column layout it had */
test('the phone board keeps its column layout after the grip is added', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 })
  await login(page); await go(page, 'editsched')
  await page.evaluate(() => (window as any).openScheduler(0))
  await page.waitForSelector('#sbBoard .sb-arow.c6r')
  const m = await page.evaluate(() => {
    /* scoped to the DUTY panel rather than "the first c6r on the board":
       its header says Role where the sims/ground ones say Item (owner,
       10 Aug 26), so an unscoped read would silently start checking a
       different panel if the panel order ever changed. */
    const row = document.querySelector('#sbBoard .sb-panel.duty .sb-arow.c6r') as HTMLElement
    const item = row.querySelector('.ain') as HTMLElement
    const hdr = document.querySelector('#sbBoard .sb-panel.duty .sb-acols.c6r') as HTMLElement
    const flyHdr = document.querySelector('#sbBoard .sb-lcols') as HTMLElement
    /* the template's own track COUNT (checked below) is fixed CSS and does
       not move if a single nth-child index is wrong — hiding the wrong
       header cell still leaves exactly as many cells visible, just the
       WRONG ones. The only thing that actually catches an off-by-one here
       is reading which labels survived, in DOM order — this is what
       "the phone board must keep the SAME column layout" actually means. */
    const visible = (el: HTMLElement) => [...el.children]
      .filter(c => getComputedStyle(c as HTMLElement).display !== 'none')
      .map(c => c.textContent)
    return {
      tracks: getComputedStyle(row).gridTemplateColumns.split(' ').length,
      item: item.getBoundingClientRect().width,
      hdrTracks: getComputedStyle(hdr).gridTemplateColumns.split(' ').length,
      c6rLabels: visible(hdr),
      flyLabels: visible(flyHdr),
    }
  })
  expect(m.tracks).toBe(3)
  expect(m.hdrTracks).toBe(3)
  /* the 6 Aug regression: the ITEM column collapsed to a 14px stub */
  expect(m.item).toBeGreaterThan(150)
  /* the labels that survive the nth-child hide, in DOM order, must be
     exactly the ones the phone body columns still show — Role/Start/End
     for the duty panel, CS/MSN/TO/LD for the flying line — or a header
     is sitting over the wrong body column even though the cell COUNT
     still happens to match the track count. */
  expect(m.c6rLabels).toEqual(['Role', 'Start', 'End'])
  expect(m.flyLabels).toEqual(['CS', 'MSN', 'TO', 'LD'])
})

/* THE NOTES ROW WAS THE ONE TEMPLATE NEVER RESTATED ON A PHONE (fix round
   1, 8 Aug 26 — found live, not by a test). .sb-nrow's three trailing
   controls (▲ ▼ ✕) used to be flat siblings, not one grid item like every
   other row's .lctl — so on desktop, with the nudge buttons display:none,
   exactly four items landed in the four-track template and it looked
   fine; on a phone, with the grip gone and the nudge buttons back, FIVE
   flat items tried to fill four tracks. The note text fell into the nx
   number's 22px column, the first control (▲) inflated to fill the 1fr
   column meant for the note, and ✕ wrapped onto an implicit second row
   under the hidden grip's column. Wrapping the controls in one .lctl
   (matching every other row) plus restating the template fixed it — this
   pins both halves: a readable text field, and a single grid row. */
test('the notes row keeps a usable text field and a single row on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 })
  await login(page); await go(page, 'editsched')
  await page.evaluate(() => (window as any).openScheduler(0))
  await page.waitForSelector('#sbBoard .sb-nrow')
  const m = await page.evaluate(() => {
    const row = document.querySelector('#sbBoard .sb-nrow') as HTMLElement
    const nin = row.querySelector('.nin') as HTMLElement
    return {
      /* row height, not child-to-child top comparisons — .sb-nrow centres
         its items (align-items:center), so .nx (a short span) and .nin
         (a padded input) legitimately sit at different tops even on a
         single grid row; height is what actually tells single-row from
         wrapped. Measured: 24px single-row (fixed), 48.5px wrapped to two
         rows (the pre-fix bug, both here and independently confirmed at
         a live 390px .sb-wide check during this fix). */
      rowHeight: row.getBoundingClientRect().height,
      ninWidth: nin.getBoundingClientRect().width,
    }
  })
  expect(m.ninWidth, 'the note text is readable, not squeezed into the number column').toBeGreaterThan(100)
  expect(m.rowHeight, 'one grid row, not wrapped onto a second').toBeLessThan(40)
})

/* the reference day's very first wave carries two formations (VL, RU), and
   the SECOND wave reuses the same two callsigns for its own pair (measured:
   DAYS[0].waves[0] and [1] both hold a VL 2-ship and a RU 2-ship) — so a
   whole-board reading of every .lin in document order sees "VL" and "RU"
   twice each no matter what the drag does, before a single pointer event.
   Scoping both the read and the adjacency check to the ONE .sb-go the grips
   came from is what actually tests "a formation's rows stay adjacent",
   the invariant the comment below names — a board-wide read would be
   asserting against this fixture's reused callsigns, not against the drag. */
test('dragging a grip reorders the wave and keeps a pair together', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await login(page); await go(page, 'editsched')
  await page.evaluate(() => (window as any).openScheduler(0))
  await page.waitForSelector('#sbBoard .sb-line[data-move]')
  const go1 = page.locator('#sbBoard .sb-go').first()
  const before = await go1.locator('.sb-line .lin').evaluateAll(els => els.map(i => (i as HTMLInputElement).value))
  const grips = go1.locator('.sb-line .sb-grip')
  const last = await grips.count() - 1
  /* the day's flying section runs taller than the 900px viewport, so the
     last row's grip starts off-screen — boundingBox() reports its real
     page position either way, but a raw mouse.move to a point outside the
     viewport hits nothing, so the row has to be scrolled into view first
     (what a real drag would require of a person, too). */
  await grips.nth(last).scrollIntoViewIfNeeded()
  const a = await grips.nth(last).boundingBox()
  await grips.nth(0).scrollIntoViewIfNeeded()
  const b = await grips.nth(0).boundingBox()
  await page.mouse.move(a!.x + a!.width / 2, a!.y + a!.height / 2)
  await page.mouse.down()
  await page.mouse.move(b!.x + b!.width / 2, b!.y + b!.height / 2, { steps: 12 })
  await page.mouse.up()
  const after = await go1.locator('.sb-line .lin').evaluateAll(els => els.map(i => (i as HTMLInputElement).value))
  expect(after).not.toEqual(before)
  /* a formation's rows stay adjacent — a callsign must never appear twice in
     two places in one Go */
  const runs = after.filter((v, i) => i === 0 || v !== after[i - 1])
  expect(new Set(runs).size).toBe(runs.length)
})

test('a phone nudge moves a row and the board still reads correctly', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 })
  await login(page); await go(page, 'editsched')
  await page.evaluate(() => (window as any).openScheduler(0))
  await page.waitForSelector('#sbBoard .sb-arow [data-mvdn]')
  const first = () => page.evaluate(() =>
    (document.querySelector('#sbBoard .sb-panel.prog .sb-arow .ain') as HTMLInputElement)?.value)
  const was = await first()
  await clickHere(page, '#sbBoard .sb-panel.prog .sb-arow [data-mvdn]')
  expect(await first()).not.toBe(was)
})

/* The board's inputs-band remarks cell is a ONE-LINE truncated summary whose
   full text lives in its title tooltip — not wrapping prose. That was not
   obvious from the stylesheet: the wrap rule (`overflow-wrap:anywhere`)
   listed `.sbi-rmk` while the markup emits `.sbi-rm`, a typo carried over
   verbatim from the original page, so for the whole life of both builds the
   rule matched nothing. Correcting the spelling was measured first and
   changes NOTHING — `white-space:nowrap` leaves no soft wrap opportunity for
   the property to act on, at either width — so the dead name was deleted
   instead (9 Aug 26). This test is what stops that being re-argued, or
   re-"fixed" into a rule that does nothing: it asserts the cell's real
   contract in a real browser, which is the only place it is visible at all
   (jsdom reports every rect as 0x0 and loads no stylesheet).
   The remark is one 80-character unbreakable word on purpose: a wrappable
   sentence would pass this test even with the nowrap lost. */
test('a long unbreakable remark stays one clipped line and keeps its full text in the tooltip', async ({ page }) => {
  const LONG = 'RETURNINGFROMDETACHMENTVIAPAYALEBARANDTENGAHWITHNOFIXEDTIMEOFARRIVALPLEASECONFIRM'
  for (const size of [DESK, PHONE]) {
    await page.setViewportSize(size)
    await login(page); await go(page, 'editsched')
    await page.evaluate(() => (window as any).openScheduler(0))
    /* `#sbInputs`, not `#sbBoard`: the two input PANELS inside the board draw
       their rows as ground-programme rows now (owner, 10 Aug 26), so the
       compact `.sbi-row` this cell belongs to lives in the day's inputs strip
       — which is where it always was, and where the clipping contract below
       is still exactly the contract. */
    await page.waitForSelector('#sbInputs .sbi-row .sbi-rm')
    await page.evaluate((t) => {
      const w = window as any
      w.INPUTS.filter((i: any) => w.inputCoversDate(i, w.DAYS[0].dt)).forEach((i: any) => { i.remarks = t })
      w.renderScheduler()
    }, LONG)
    await page.waitForTimeout(300)
    const m = await page.evaluate(() => {
      const el = document.querySelector('#sbInputs .sbi-row .sbi-rm') as HTMLElement
      const row = el.parentElement as HTMLElement
      const cs = getComputedStyle(el)
      return {
        text: el.textContent, title: el.title,
        h: Math.round(el.getBoundingClientRect().height),
        ws: cs.whiteSpace, te: cs.textOverflow, ov: cs.overflowX,
        rowW: Math.round(row.getBoundingClientRect().width), rowScrollW: row.scrollWidth,
      }
    })
    const tag = size === DESK ? 'desktop' : 'phone'
    expect(m.text, `${tag}: sanity — the long remark really is the one being measured`).toBe(LONG)
    expect(m.title, `${tag}: the full text is reachable in the tooltip, since the cell clips it`).toBe(LONG)
    /* ONE line. A wrapped 80-character word would be several times this at
       11px/10.5px, so a lost nowrap fails here rather than passing quietly. */
    expect(m.h, `${tag}: the remark stays on a single line`).toBeLessThanOrEqual(20)
    expect(m.ws, `${tag}: nowrap is the mechanism, not an accident of the text`).toBe('nowrap')
    expect(m.te, `${tag}: clipped with an ellipsis, not cut mid-glyph`).toBe('ellipsis')
    expect(m.ov, `${tag}: the overflow is hidden, so the ellipsis can be drawn`).toBe('hidden')
    /* and the row it sits in gains no sideways scroll from it */
    expect(m.rowScrollW, `${tag}: the remark does not push its own row wider`).toBeLessThanOrEqual(m.rowW + 1)
  }
})

/* finding #1 (whole-branch review, 9 Aug 26): sbGrip() used to return '' for
   a read-only board, but every row template in scheduler.css unconditionally
   keeps its leading 18px grip track — so a read-only board lost each row's
   FIRST grid item while the template still had ten tracks: every field
   shifted one track left, out of register with its own header. jsdom cannot
   see this at all (every rect is 0x0), so it has to be a real-browser
   measurement.
   The route in has since changed: leaving Edit Schedule now closes the board
   outright (pinned by the block below), so the ONE way to a rendered
   read-only board short of a preview is a session that may not edit one — a
   squadron member, driven in through the same bare globals the member tests
   below use. The register fix (sbGrip always emitting its track, gating only
   a `.ro` class that is visibility:hidden rather than display:none) is still
   live defence for exactly that render, and this measures both sides of it:
   an admin's board and a member's must put the same fields in the same
   tracks. */
test('the board keeps its row register on a read-only render (finding #1, via a member session now)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await login(page); await go(page, 'editsched')
  await page.evaluate(() => (window as any).openScheduler(0))
  await page.waitForSelector('#sbBoard .sb-line[data-move]')
  /* .lin is the flying line's callsign box, a fixed 64px track; .sb-nrow
     .nin is the overall-day free-text note line, a wide 1fr track — the two
     the reviewer measured live (64px and 783px respectively). The seed's
     day 0 already carries a note, so .sb-nrow exists without adding one. */
  const measure = () => page.evaluate(() => {
    const lin = document.querySelector('#sbBoard .sb-line .lin') as HTMLElement
    const nts = document.querySelector('#sbBoard .sb-nrow .nin') as HTMLElement
    return { lin: lin.getBoundingClientRect().width, nts: nts.getBoundingClientRect().width }
  })
  const edit = await measure()
  /* the callsign box is a fixed 64px track and the notes box a flexible
     1.2fr one — sanity-check the edit-mode board actually has room before
     trusting the read-only comparison below */
  expect(edit.lin).toBeGreaterThan(50)
  expect(edit.nts).toBeGreaterThan(300)

  /* a member session, not a page nav and no longer a toggle: setPage +
     openScheduler are bare app globals with no role check of their own
     (the same door the member tests below use), because a member has no
     Edit Schedule link to click. login() re-navigates, so the read-only
     board is measured in a genuinely fresh session at the same viewport —
     which is what makes comparing the two sets of widths meaningful. */
  await login(page, 'user')
  await page.evaluate(() => (window as any).setPage('editsched'))
  await page.evaluate(() => (window as any).openScheduler(0))
  await page.waitForSelector('#sbBoard .sb-line')
  expect(await page.evaluate(() => (window as any).editMode()),
    'sanity: this really is the read-only render').toBe(false)
  const ro = await measure()
  expect(ro.lin, 'the callsign input keeps its full width, not the 18px grip track').toBeGreaterThan(50)
  expect(ro.nts, 'the notes input stays usable, not squeezed into ~22px').toBeGreaterThan(300)
  expect(Math.round(ro.lin)).toBe(Math.round(edit.lin))
  expect(Math.round(ro.nts)).toBe(Math.round(edit.nts))
})

/* Leaving Edit Schedule closes the board, pinned live in a real browser
   (jsdom's rects are all 0×0, so `hidden` is the only thing it CAN see here
   — the visibility this test actually cares about needs a layout engine).
   The board is CLOSED outright on the way out, not merely hidden — state/view.ts's
   setPage clears SBDAY the moment the page leaves 'editsched', because a
   document-level handler elsewhere (Shell.tsx's right-click clear-a-seat)
   used to trust SBDAY!=null on its own as proof the board was safely open,
   which stopped being true once the render alone stopped painting it.
   Landing back on Edit Schedule therefore does NOT resume a day any more —
   there is nothing to resume, it was cleared — a scheduler opens one
   again, same as any other visit. */
test('navigating away from Edit Schedule with the board open hides it, not just its controls', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await login(page); await go(page, 'editsched')
  await page.evaluate(() => (window as any).openScheduler(0))
  await page.waitForSelector('#sbBoard .sb-line')
  await expect(page.locator('#schedBoard')).toBeVisible()
  await go(page, 'viewsched')
  await expect(page.locator('#schedBoard')).toBeHidden()
  expect(await page.evaluate(() => (window as any).SBDAY), 'SBDAY is cleared, not just the render gate').toBeNull()
  /* landing back on Edit Schedule does NOT silently resume a day */
  await go(page, 'editsched')
  await expect(page.locator('#schedBoard')).toBeHidden()
  expect(await page.evaluate(() => (window as any).SBDAY)).toBeNull()
})

/* THE BLOCKER (coordinator review, 9 Aug 26), driven live with a REAL
   pointer right-click — proven this way by the reviewer, and the only way
   to actually exercise it: jsdom can dispatch a synthetic 'contextmenu'
   event (pinned in board.test.tsx), but the reviewer's own reproduction
   was "a real pointer confirmed this on the built bundle", and a real
   right-click is also what proves the WEEK puck is genuinely reachable by
   a pointer once the board no longer covers it — before this fix, the
   modal's own subtree intercepted pointer events on the page underneath
   (confirmed live during this fix's verification: a real Playwright click
   on the nav timed out with "subtree intercepts pointer events" while the
   board was still open), so the exploit needed the board to have ALREADY
   closed its paint while SBDAY stayed alive — exactly the state a nav
   click reaches. */
test('the blocker: right-clicking a WEEK puck on View-only Sched does not clear it, even with a board previously left open', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await login(page); await go(page, 'editsched')
  await page.evaluate(() => (window as any).openScheduler(0))
  await page.waitForSelector('#sbBoard .sb-line')
  await go(page, 'viewsched')
  await page.waitForSelector('#vWeek .seat[data-slot]')
  const seat = page.locator('#vWeek .seat[data-slot]').first()
  const key = await seat.getAttribute('data-slot')
  const before = await page.evaluate((k) => (window as any).slotVal(k), key)
  expect(before, 'sanity: the targeted seat is actually filled').toBeTruthy()
  await seat.click({ button: 'right' })
  const after = await page.evaluate((k) => (window as any).slotVal(k), key)
  expect(after, 'the seat was NOT cleared by a real right-click').toBe(before)
})

/* the squadron-member gate, actually exercised (review fix, 9 Aug 26): this
   used to count reorder controls on a page where the board was never
   opened at all — CURPAGE stays 'viewsched' and #schedBoard never mounts
   any row, so the count is trivially 0 whether or not the gate works, and
   it would still read 0 with sbGrip's `ro` check deleted outright. A
   squadron member cannot reach the board through the UI (no sb-open day
   head is ever rendered for them — canEditSched() is false, so ed is false
   on every day, and Edit Schedule itself is hidden from their nav), but
   `window.openScheduler` is a bare app global with no role check of its
   own, so this drives the same board render the admin path does and reads
   what canEditSched()-gated editMode() actually produces: a rendered board
   (proving the gate was really exercised, not vacuously true) with no
   data-move and no data-mvup anywhere in it.
   SchedBoard's `open` also
   requires CURPAGE==='editsched', and Edit Schedule's nav link does not
   exist for a member to click — so `window.setPage` (the same bare-global
   idiom as `openScheduler` itself) forces the page the same way, proving
   the ROLE gate on the render rather than accidentally proving the page
   gate hid it instead. */
test('a squadron member who reaches the board gets a read-only render — no grip, no nudge', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await login(page, 'user')
  await page.evaluate(() => (window as any).setPage('editsched'))
  await page.evaluate(() => (window as any).openScheduler(0))
  await page.waitForSelector('#sbBoard .sb-line')
  const n = await page.evaluate(() => ({
    rows: document.querySelectorAll('#sbBoard .sb-line, #sbBoard .sb-arow, #sbBoard .sb-nrow').length,
    move: document.querySelectorAll('[data-move],[data-mvup],[data-mvdn]').length,
  }))
  expect(n.rows, 'the board actually rendered rows — otherwise this proves nothing').toBeGreaterThan(0)
  expect(n.move).toBe(0)
})

/* ONE assertion for every button-row on the board, not one row at a time
   (owner review, 9 Aug 26 — round 1 of 5). The wave header ("Go N") shipped
   with a hand-written test for exactly this failure (it packs a select, an
   in-time readout and three .gctl buttons into one flex row, and Auto sort's
   extra button once ran it 19px past its own width on a 390px phone), and
   .sb-go has overflow:hidden, so what didn't fit wasn't scrollable — it was
   CROPPED, and one of the three buttons deletes the whole wave. Then Sort
   all (task 10) landed a FOURTH button in a completely different row,
   .sb-actions, and did the same thing again: 7px of overflow nothing caught
   until a person measured it by hand. Two rows, same shape of bug, twice —
   so this walks every row that packs buttons/inputs into one flex line
   (the top action bar, every wave header, every panel header's controls,
   and every duty/sim sub-header) and asserts none of them overflows, rather
   than pinning one row at a time and waiting for the third.
   scrollWidth vs clientWidth is a real-browser measurement jsdom cannot
   make — every one of these assertions must fail against the un-fixed CSS
   and pass once the row's .gctl gets its own line on a phone. */
test('no button/control row on the board overflows its own width on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 })
  await login(page); await go(page, 'editsched')
  await page.evaluate(() => (window as any).openScheduler(0))
  await page.waitForSelector('#sbBoard .sb-go-h')
  const ROW_SELECTORS = ['.sb-top', '.sb-actions', '.sb-go-h', '.sb-ph', '.sb-psub']
  const ROWS = ROW_SELECTORS.join(', ')
  const rows = await page.evaluate((sel) =>
    [...document.querySelectorAll(sel)].map(el => ({
      sel: el.className,
      scroll: (el as HTMLElement).scrollWidth,
      client: (el as HTMLElement).clientWidth,
      text: (el.textContent || '').trim().slice(0, 40),
    })), ROWS)
  /* the seed day has at least one of EVERY kind (top bar, wave header, every
     panel header, every duty/sim sub-header) — a PER-SELECTOR presence
     check, not one aggregate count across all five (review fix, 9 Aug 26):
     an aggregate total clears its own bar even when one whole selector's
     rows silently stop matching (a class rename, a panel that stops
     rendering) so long as the other four still supply enough rows between
     them — the exact way a real gap in coverage could hide behind a
     healthy-looking total. */
  const counts = await page.evaluate((sels) =>
    sels.map(s => ({ sel: s, n: document.querySelectorAll(s).length })), ROW_SELECTORS)
  const missing = counts.filter(c => c.n === 0).map(c => c.sel)
  expect(missing, 'every row kind must have at least one match on the seed day').toEqual([])
  /* ONE assertion over every offending row rather than expect-inside-a-loop:
     a loop's expect() throws on the FIRST failure and hides the rest — an
     outer row (.sb-top) and the inner row that actually caused it
     (.sb-actions) can both be over at once, and a loop would only ever name
     the outer one. Collecting every failure into one message means the
     SPECIFIC row (class + a snippet of its own text) is always named,
     however many rows are broken at once. */
  const bad = rows.filter(m => m.scroll > m.client)
    .map(m => `"${m.sel}" ("${m.text}…") scrollWidth ${m.scroll} > clientWidth ${m.client}`)
  expect(bad, 'no row may scroll past its own width').toEqual([])
})

/* ---- the late-input mark (owner, 9 Aug 26) ------------------------------
   "This late input will be visible throughout and it sticks with that input
   even though it's on view schedule." The view-only half is the reason this
   is measured in a browser rather than left to the markup tests: jsdom can
   prove the badge was EMITTED, but not that it is on screen, readable, and
   has not knocked the row it lives in out of register. */
test('a late input\'s mark is visible on the view-only page, where the squadron reads it', async ({ page }) => {
  await page.setViewportSize(DESK)
  await login(page)                       // lands on View-only Sched
  await page.waitForSelector('#vWeek .day')
  const tag = page.locator('#vWeek .latetag').first()
  await expect(tag, 'the view page carries at least one late mark').toBeVisible()
  /* it has to READ, not merely exist — a zero-sized or transparent badge is
     the failure mode a markup test cannot see */
  const box = await tag.boundingBox()
  expect(box!.width, 'the badge has real width').toBeGreaterThan(14)
  expect(box!.height, 'and real height').toBeGreaterThan(7)
  const seen = await tag.evaluate((el: any) => {
    const s = getComputedStyle(el)
    return { text: el.textContent, op: +s.opacity, vis: s.visibility, title: el.getAttribute('title') || '' }
  })
  expect(seen.text).toBe('LATE')
  expect(seen.op).toBeGreaterThan(0.9)
  expect(seen.vis).toBe('visible')
  /* and it says WHICH deadline it missed, rather than just shouting */
  expect(seen.title).toContain('deadline')
})

test('the mark never widens or overflows the row it sits in', async ({ page }) => {
  await page.setViewportSize(PHONE)       // the tight case: a 390px day box
  await login(page)
  await page.waitForSelector('#vWeek .day')
  const bad = await page.evaluate(() => {
    const out: string[] = []
    document.querySelectorAll('#vWeek .latetag').forEach((t: any) => {
      const row = t.closest('.pl-row') as HTMLElement
      if (!row) { out.push('no row'); return }
      const tr = t.getBoundingClientRect(), rr = row.getBoundingClientRect()
      if (tr.right > rr.right + 0.5) out.push('badge spills its row')
      if (row.scrollWidth > row.clientWidth + 1) out.push('row gained a sideways scroll')
    })
    return out
  })
  expect(bad).toEqual([])
})

test('a promoted late input keeps the board row in register — no eighth grid item', async ({ page }) => {
  /* the board's duty/sim/ground row is a seven-track template and its header
     reserves exactly seven. The mark rides as a row class precisely so this
     count cannot move; if someone later "improves" it into a chip, this is
     what goes red rather than the fields silently walking one track left. */
  await page.setViewportSize(DESK)
  await login(page); await go(page, 'editsched')
  await page.evaluate(() => {
    const w = window as any
    const inp = w.INPUTS.find((i: any) => i.person === 'salsa')
    w.acceptInput(1, inp, 'g')
    w.openScheduler(1)
  })
  await page.waitForSelector('#sbBoard .sb-arow.c6r')
  const reg = await page.evaluate(() => {
    const row = document.querySelector('#sbBoard .sb-arow.c6r.lateinp') as HTMLElement
    if (!row) return { found: false, items: 0, cols: 0, left: 0, headLeft: 0 }
    const head = row.closest('.sb-panel')!.querySelector('.sb-acols.c6r') as HTMLElement
    const cell = row.children[1] as HTMLElement          // the ITEM cell
    const hcell = head.children[1] as HTMLElement        // its own heading
    return {
      found: true,
      items: row.children.length,
      cols: head.children.length,
      left: Math.round(cell.getBoundingClientRect().left),
      headLeft: Math.round(hcell.getBoundingClientRect().left),
    }
  })
  expect(reg.found, 'the promoted row rendered and carries the late class').toBe(true)
  expect(reg.items, 'same number of grid items as the header has tracks').toBe(reg.cols)
  expect(reg.left, 'and the ITEM cell still sits under the ITEM heading').toBe(reg.headLeft)
})

/* ---- carrying the day across a page switch (owner, 9 Aug 26) -------------
   "If the admin is viewing on view only schedule that certain day, when the
   edit schedule mode is entered, it will show the same day that the admin was
   viewing vice versa."

   Measured in a browser because it is a scroll position, and jsdom reports
   every rect as 0x0 — src/state/carryday.test.ts can prove setPage took a
   reading and nothing about where the week actually landed. The two viewports
   are not padding either: the desktop week shows several days at once and the
   phone shows one, so "the same day" means different scroll maths on each. */

/* the leftmost day still on screen — the reading the app itself carries */
async function dayOnScreen(page: any, wid: string) {
  return page.evaluate((id: string) => {
    const w = document.getElementById(id) as HTMLElement
    const ds = [...w.querySelectorAll('.day[data-day]')] as HTMLElement[]
    const x = w.getBoundingClientRect().left + 8
    const hit = ds.find(d => d.getBoundingClientRect().right > x) || ds[0]
    return +hit.dataset.day!
  }, wid)
}
/* park a week on a day by scrolling it there, then let the scroll settle */
async function parkOn(page: any, wid: string, di: number) {
  await page.evaluate(([id, d]: any) => {
    const w = document.getElementById(id) as HTMLElement
    const day = w.querySelector(`.day[data-day="${d}"]`) as HTMLElement
    w.scrollLeft += day.getBoundingClientRect().left - w.getBoundingClientRect().left
  }, [wid, di])
  await settleWeek(page, '#' + wid)
}

for (const [name, vp] of [['desktop', DESK], ['phone', PHONE]] as const) {
  test(`${name}: Edit Schedule opens on the day View-only was showing`, async ({ page }) => {
    await page.setViewportSize(vp)
    await login(page)
    await parkOn(page, 'vWeek', 3)
    const from = await dayOnScreen(page, 'vWeek')
    /* the week may not scroll far enough to put day 3 flush left on a wide
       screen — what matters is that wherever it settled is where edit opens,
       so the assertion is against the reading taken, not against 3 */
    await go(page, 'editsched')
    await settleWeek(page, '#eWeek')
    expect(await dayOnScreen(page, 'eWeek'), 'edit opened on the day view was showing').toBe(from)
  })

  test(`${name}: and back the other way — View-only opens on the day Edit was showing`, async ({ page }) => {
    await page.setViewportSize(vp)
    await login(page)
    await go(page, 'editsched')
    await parkOn(page, 'eWeek', 4)
    const from = await dayOnScreen(page, 'eWeek')
    await go(page, 'viewsched')
    await settleWeek(page, '#vWeek')
    expect(await dayOnScreen(page, 'vWeek'), 'view opened on the day edit was showing').toBe(from)
  })
}

test('a repaint that is not a page switch still holds the week where it is', async ({ page }) => {
  /* the carry must be consumed ONCE. If it stuck, every later repaint would
     drag the week back to the carried day — which is the B54 scroll-hold
     guarantee broken, and it would show up as the week jumping while you type. */
  await page.setViewportSize(DESK)
  await login(page)
  await go(page, 'editsched')
  await parkOn(page, 'eWeek', 2)
  const parked = await dayOnScreen(page, 'eWeek')
  /* a store tick with no page change: setPage to the page already showing
     notifies (so every week repaints) but cannot capture a carry */
  await page.evaluate(() => (window as any).setPage('editsched'))
  await page.waitForTimeout(400)
  expect(await dayOnScreen(page, 'eWeek'), 'a plain repaint moved nothing').toBe(parked)
})

/* EDITING AN INPUT FROM THE SCHEDULE (owner, 10 Aug 26). The control is the
   input's own TYPE LABEL, and that is a layout decision before it is a UX one:
   both surfaces draw these rows as grids with every track spoken for, and each
   of the three shapes that put a separate button in the row cost the row
   height at one width or the other (the reasoning is in html.ts's
   inpEditLabel and beside the rule in scheduler.css). So the contract to hold
   is that turning the label into a button moved NOTHING — and jsdom cannot
   see that at all, since it reports every rect as 0x0.
   The board half is measured under a remark long enough to fill the cell it
   clips with an ellipsis, which is where an earlier shape hid the control. */
test.describe('editing an input from the schedule', () => {
  const LONG = 'RETURNINGFROMDETACHMENTVIAPAYALEBARANDTENGAHWITHNOFIXEDTIMEOFARRIVALPLEASECONFIRM'
  for (const [name, viewport] of [['phone', PHONE], ['desktop', DESK]] as const) {
    test(`${name}: the control costs its row no height, and stays reachable under a long remark`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await login(page)
      /* the same rows, on the page that carries the control and the page that
         does not — the Unavailable block is the one drawn on both, and the one
         with no Accept button to hide a second line behind */
      await go(page, 'viewsched')
      const bare = await page.evaluate(() => [...document.querySelectorAll('#vWeek .day[data-day="0"] .sec-unav .pl-row')]
        .map(r => Math.round(r.getBoundingClientRect().height)))
      await go(page, 'editsched')
      const live = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="0"] .sec-unav .pl-row')]
        .map(r => Math.round(r.getBoundingClientRect().height)))
      expect(live.length, 'the same rows are drawn on both pages').toBe(bare.length)
      expect(live.length).toBeGreaterThan(0)
      /* NOT equality any more (owner, 10 Aug 26 — the times and remarks became
         typeable cells). A row may cost a few pixels for a cell that has to be
         tappable; what it may not do is gain a LINE, which is what every
         rejected shape did. Measured at this commit: identical on desktop,
         +3px a row on a phone, where the two time cells stack into the single
         TIME column and the second one is empty on an all-day row. A line at
         these sizes is 11px and up, so 6 catches one and tolerates this. */
      live.forEach((h, i) => expect(h - bare[i], `${name}: row ${i} grew by a line`).toBeLessThanOrEqual(6))
      expect(live.every((h, i) => h >= bare[i]), `${name}: sanity — no row shrank`).toBe(true)
      expect(await page.locator('#eWeek .day[data-day="0"] .sec-unav [data-inpedit]').count(),
        'every row on the edit week carries the type control').toBe(live.length)
      /* and the cells themselves: two times and a remark, on every row */
      expect(await page.locator('#eWeek .day[data-day="0"] .sec-unav [data-inp]').count(),
        'and three typeable cells').toBe(live.length * 3)

      /* on the board, with a remark long enough to fill the cell it clips */
      await page.evaluate((t) => {
        const w = window as any
        w.INPUTS.filter((i: any) => w.inputCoversDate(i, w.DAYS[0].dt)).forEach((i: any) => { i.remarks = t })
        w.openScheduler(0)
      }, LONG)
      await page.waitForSelector('#schedBoard .pinp [data-inpedit]')
      const m = await page.evaluate(() => {
        const btn = document.querySelector('#schedBoard .pinp [data-inpedit]') as HTMLElement
        btn.scrollIntoView({ block: 'center' })
        const row = btn.closest('.sb-arow') as HTMLElement
        const b = btn.getBoundingClientRect(), r = row.getBoundingClientRect()
        const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2) as HTMLElement
        return {
          tag: btn.tagName,
          inside: b.right <= r.right + 1 && b.left >= r.left && b.top >= r.top - 1 && b.bottom <= r.bottom + 1,
          w: Math.round(b.width), h: Math.round(b.height),
          reached: !!(hit && hit.closest('[data-inpedit]')),
          rowScrolls: row.scrollWidth > Math.round(r.width) + 1,
        }
      })
      expect(m.tag, `${name}: a real button, so the keyboard reaches it too`).toBe('BUTTON')
      expect(m.w, `${name}: it has a real size`).toBeGreaterThan(12)
      expect(m.h, `${name}: it has a real size`).toBeGreaterThan(10)
      expect(m.inside, `${name}: it sits inside its own row, not over the next one`).toBe(true)
      expect(m.reached, `${name}: a press at its centre reaches it, not the remark over it`).toBe(true)
      expect(m.rowScrolls, `${name}: it does not push the row sideways`).toBe(false)
    })
  }

  /* "They can be editable in the same modality as ground programme" (owner,
     10 Aug 26) is a REGISTER claim as much as a behaviour one: the input rows
     and the ground rows sit one above the other in the same board, under
     headers of their own, and a row that put Start where Ground puts End
     would read as a mistake. Both use `sb-arow c6r`, so this measures that
     they actually land in the same tracks — including the leading grip track,
     which an input row keeps precisely so it does (the bare <span> that first
     stood in its place was not hidden by the phone rule and shunted every
     field one column left). */
  for (const [name, viewport] of [['phone', PHONE], ['desktop', DESK]] as const) {
    test(`${name}: an input row lines up with the ground programme's rows`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await login(page); await go(page, 'editsched')
      await page.evaluate(() => (window as any).openScheduler(0))
      await page.waitForSelector('#schedBoard .pinp .sb-arow')
      const m = await page.evaluate(() => {
        const lefts = (sel: string) => {
          const r = document.querySelector(sel) as HTMLElement
          if (!r) return null
          const base = r.getBoundingClientRect().left
          return [...r.children].map(c => Math.round((c as HTMLElement).getBoundingClientRect().left - base))
        }
        const row = document.querySelector('#schedBoard .pinp .sb-arow') as HTMLElement
        return {
          inp: lefts('#schedBoard .pinp .sb-arow'),
          grnd: lefts('#schedBoard .grnd .sb-arow'),
          scrolls: row.scrollWidth > Math.round(row.getBoundingClientRect().width) + 1,
        }
      })
      expect(m.grnd, 'sanity — there is a ground row to compare against').toBeTruthy()
      expect(m.inp!.length, 'same number of cells as a ground row').toBe(m.grnd!.length)
      /* the first four tracks are the ones both rows fill the same way: grip,
         item, start, end. Beyond those a ground row carries CX/flag/delete
         where an input carries Accept, so their widths legitimately differ. */
      expect(m.inp!.slice(0, 4), 'grip, item, start and end land in the same tracks').toEqual(m.grnd!.slice(0, 4))
      expect(m.scrolls, 'and the row gains no sideways scroll').toBe(false)
    })
  }

  test('the dialog fits a phone and never scrolls the page sideways', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await login(page)
    await go(page, 'editsched')
    await page.click('#eWeek .day[data-day="0"] .sec-unav [data-inpedit]')
    await page.waitForSelector('#inpEditPop:not([hidden])')
    /* the seed's Unavailable rows are all-day, which hides the two time boxes
       — put the dialog on a half-day so every field it can show is showing */
    await page.click('#inpEditSpan [data-span="am"]')
    const m = await page.evaluate(() => {
      const box = document.querySelector('#inpEditPop .airpop-box') as HTMLElement
      const r = box.getBoundingClientRect()
      const t = document.getElementById('inpEditStart')!.getBoundingClientRect()
      return { w: Math.round(r.width), left: Math.round(r.left), body: document.body.scrollWidth,
        timeW: Math.round(t.width),
        fields: [...box.querySelectorAll('select,input')].filter(e => {
          const b = e.getBoundingClientRect()
          return b.width > 0 && (b.right > r.right + 1 || b.left < r.left - 1)
        }).length }
    })
    expect(m.w, 'the dialog fits inside the phone').toBeLessThanOrEqual(PHONE.width)
    expect(m.left, 'and is not pushed off the left edge').toBeGreaterThanOrEqual(0)
    expect(m.body, 'the page gains no sideways scroll from it').toBeLessThanOrEqual(PHONE.width)
    expect(m.fields, 'no field spills out of the dialog').toBe(0)
    /* THE TIME BOXES HAVE TO HOLD "12:00 AM". Chromium renders
       `<input type=time>` in the BROWSER's locale, which on en-US is a
       12-hour field, and at 110px it drew "12:00 A" with the marker cut off —
       found on the deployed page, after every other gate was green. Nothing
       else can catch it: the truncation happens inside the field's own shadow
       DOM, so scrollWidth read 108 against a 110px box and reported no
       overflow. So the contract is the WIDTH, measured — 130 draws it in
       full, 110 does not. */
    expect(m.timeW, 'the time boxes are wide enough for a 12-hour clock').toBeGreaterThanOrEqual(128)
  })
})

/* ===================================================================
   THE PHONE BOARD'S TOP BAR (owner, 11 Aug 26 — comp approved first)
   The bar was four stacked rows and 166px of a 780px screen: the title, the
   seven Mon–Sun chips, then six buttons that flex-wrap folded onto two lines.
   The reform is the owner's list — chips out and swipe instead, `+ Line` out
   because every wave header already has one, every label hidden, undo/redo
   in, one row. Every number below is why this belongs in THIS gate and not
   in Vitest: jsdom reports each of them as 0.
   =================================================================== */
test.describe('the phone board keeps its controls to one row', () => {
  test('the buttons sit on a single line and the bar does not overflow sideways', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await login(page)
    await go(page, 'editsched')
    await page.evaluate(() => (window as any).openScheduler(0))
    await page.waitForSelector('#schedBoard .sb-actions .abtn')

    const m = await page.evaluate(() => {
      const acts = document.querySelector('.sb-actions') as HTMLElement
      const top = document.querySelector('.sb-top') as HTMLElement
      const btns = [...acts.querySelectorAll(':scope > .abtn, :scope > select')] as HTMLElement[]
      const tops = new Set(btns.map(b => Math.round(b.getBoundingClientRect().top)))
      return {
        rows: tops.size,
        barH: Math.round(top.getBoundingClientRect().height),
        overflow: top.scrollWidth - top.clientWidth,
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        /* every control has to stay a finger-sized target while shrinking */
        smallest: Math.min(...btns.map(b => Math.round(b.getBoundingClientRect().width))),
        labelsHidden: [...acts.querySelectorAll('.bl')].every(l => (l as HTMLElement).offsetParent === null),
      }
    })
    expect(m.rows, 'every top-bar control shares one line').toBe(1)
    expect(m.overflow, 'and that line fits — nothing is clipped or pushed off').toBeLessThanOrEqual(0)
    expect(m.pageOverflow, 'and the board gains no sideways scrollbar').toBeLessThanOrEqual(0)
    expect(m.labelsHidden, 'the words come off the buttons on a phone').toBe(true)
    expect(m.smallest, 'the icons stay tappable').toBeGreaterThanOrEqual(28)
    /* the whole bar, dots and arrows included: 75px measured, against the 166px
       of four stacked rows it replaces. It was 58px before the dots became a
       SCRUB bar (owner, 11 Aug 26) — a 9px row of dots cannot be grabbed and
       tracked along, so the strip grew to 21px, and that 12px buys the drag.
       It went 70 → 75 on 12 Aug 26, when the swipe was replaced by two arrows
       on that same day row (owner: "just put arrows at the edges of the bar at
       the top"): a 26px control against 16px dots is the 5px, and it is the
       whole cost of the change, since the arrows took no width from the title or
       the eight buttons on line one.
       The bound is 82 rather than 76 so an ordinary type or padding tweak does
       not fail the gate, while a second row of 30px buttons (which would put it
       past 100) still cannot fit under it — which is the regression this number
       has always been here to catch. */
    expect(m.barH, 'the bar is a fraction of the screen it used to eat').toBeLessThan(82)
  })

  /* THE DATE USED TO BE ELLIPSED OFF THE BAR (owner, 12 Aug 26 — "Seems like
     the Wednesday blocked off the date"). `.sb-title` is nowrap + overflow
     hidden + ellipsis on a phone, so the day name and the date compete for one
     box and the longest names won: the bar read "Wednesday Jul…". The fix hides
     the day name's tail with the same `.bl` class the buttons use, which only
     CSS can do — jsdom paints nothing, so the DOM-shape half of this is in
     `boardnav.test.tsx` and the half that MEASURES is here. Wednesday is the
     worst case of the seven and the day in the owner's screenshot. */
  test('the day and the date both fit the phone bar, on the longest day name', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await login(page)
    await go(page, 'editsched')
    await page.evaluate(() => (window as any).openScheduler(2))    // Wednesday
    await page.waitForSelector('#sbDate')
    const m = await page.evaluate(() => {
      const t = document.querySelector('.sb-title') as HTMLElement
      const day = document.querySelector('#sbDay') as HTMLElement
      const date = document.querySelector('#sbDate') as HTMLElement
      const tail = day.querySelector('.bl') as HTMLElement
      const box = t.getBoundingClientRect(), dr = date.getBoundingClientRect()
      return {
        clipped: t.scrollWidth - t.clientWidth,
        /* innerText, NOT textContent: the tail is display:none, and
           textContent reads hidden nodes too — it says "Wednesday" whether the
           fix works or not, which is exactly the assertion this test must not
           make. innerText is what a reader sees. */
        shown: day.innerText,
        full: day.textContent,
        tailPainted: tail.offsetParent !== null,
        /* the date's own box has to sit inside the title's, not merely exist:
           an ellipsed run still reports a rect that runs off the end */
        dateInside: dr.width > 0 && Math.round(dr.right) <= Math.round(box.right),
        dateText: date.textContent,
      }
    })
    expect(m.tailPainted, 'the day name loses its tail under 820px').toBe(false)
    expect(m.shown, 'so the bar reads Wed, matching the dots and the day strip').toBe('Wed')
    expect(m.full, 'while the whole word is still in the markup for desktop').toBe('Wednesday')
    expect(m.clipped, 'and nothing in the title is cut off any more').toBeLessThanOrEqual(0)
    expect(m.dateInside, 'the date is painted inside the title, not past its edge').toBe(true)
    expect(m.dateText, 'and it is the whole date').toBe('Jul 15')
  })

  /* and the desktop bar, which has the room, keeps the whole word */
  test('the full day name comes back above 820px', async ({ page }) => {
    await page.setViewportSize(DESK)
    await login(page)
    await go(page, 'editsched')
    await page.evaluate(() => (window as any).openScheduler(2))
    await page.waitForSelector('#sbDate')
    const m = await page.evaluate(() => {
      const t = document.querySelector('.sb-title') as HTMLElement
      const day = document.querySelector('#sbDay') as HTMLElement
      return {
        text: (day.innerText || '').trim(),
        tailPainted: (day.querySelector('.bl') as HTMLElement).offsetParent !== null,
        clipped: t.scrollWidth - t.clientWidth,
      }
    })
    expect(m.tailPainted, 'the tail paints again once there is width for it').toBe(true)
    expect(m.text, 'a desktop still reads the day out in full').toBe('Wednesday')
    expect(m.clipped, 'and it fits').toBeLessThanOrEqual(0)
  })

  test('the day chips are dots, and tapping one still jumps to that day', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await login(page)
    await go(page, 'editsched')
    await page.evaluate(() => (window as any).openScheduler(0))
    await page.waitForSelector('#sbDays [data-sbtab]')
    const m = await page.evaluate(() => {
      const ds = [...document.querySelectorAll('#sbDays [data-sbtab]')] as HTMLElement[]
      const w = ds.map(d => Math.round(d.getBoundingClientRect().width))
      const mark = getComputedStyle(ds[3], '::after').borderRadius
      return { widths: w, dotBox: w[3], allEqual: new Set(w).size === 1, mark }
    })
    expect(m.dotBox, 'a day is a small square, not a Mon-13 chip').toBeLessThanOrEqual(18)
    /* THE SCRUB DEPENDS ON THIS: if the selected day's box grew, every dot
       after it would shift sideways under a tracking finger. Only the mark
       inside the box changes. */
    expect(m.allEqual, 'every day owns the same footprint, selected or not').toBe(true)
    await page.locator('#sbDays [data-sbtab]').nth(3).click()
    expect(await page.evaluate(() => (window as any).SBDAY)).toBe(3)
    const after = await page.evaluate(() =>
      new Set([...document.querySelectorAll('#sbDays [data-sbtab]')]
        .map(d => Math.round(d.getBoundingClientRect().width))).size)
    expect(after, 'and still the same after one is selected').toBe(1)
  })

  /* THE PAIRING THAT TOOK TWO ATTEMPTS (owner, 11 Aug 26 — a drag down the
     right-hand edge moved nothing). The parked handle is fixed, so its touch
     scroll goes to the viewport, which cannot scroll here; the drag is
     forwarded to the board by hand (`wireParkedRosScroll`). That forwarder
     only works if the browser does NOT also claim the gesture — with
     `touch-action:pan-y` it fires pointercancel after one move and the
     scroll dies at 18px of 264. Hence `none` while parked, and NOT while
     open, where the crew list owns its own scrolling. Both halves are
     asserted, because either alone silently breaks the other. */
  test('the parked aircrew handle does not claim the gesture it forwards', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await login(page)
    await go(page, 'editsched')
    await page.evaluate(() => (window as any).openScheduler(0))
    await page.waitForSelector('#schedBoard .sb-ros .ros-tab')
    const parked = await page.evaluate(() => ({
      tab: getComputedStyle(document.querySelector('#schedBoard .sb-ros .ros-tab')!).touchAction,
      aside: getComputedStyle(document.querySelector('#schedBoard .sb-ros')!).touchAction,
      overTheRightEdge: Math.round(document.querySelector('#schedBoard .sb-ros')!.getBoundingClientRect().left) < 390,
    }))
    expect(parked.tab, 'parked, the handle leaves the whole gesture to the forwarder').toBe('none')
    expect(parked.aside).toBe('none')
    expect(parked.overTheRightEdge, 'and it really does sit under a thumb at the right edge').toBe(true)

    await page.locator('#schedBoard .sb-ros .ros-tab').click()
    await page.waitForTimeout(350)
    const open = await page.evaluate(() =>
      getComputedStyle(document.querySelector('#schedBoard .sb-ros .ros-tab')!).touchAction)
    expect(open, 'open, the drawer scrolls its own crew list again').not.toBe('none')
  })

  test('the open AIRCREW drawer starts below the bar and scrolls', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await login(page)
    await go(page, 'editsched')
    await page.evaluate(() => (window as any).openScheduler(0))
    await page.waitForSelector('#schedBoard .sb-ros .ros-tab')
    await page.locator('#schedBoard .sb-ros .ros-tab').click()
    await page.waitForTimeout(350)                       // the .2s slide

    const m = await page.evaluate(() => {
      const ros = document.querySelector('#schedBoard .sb-ros') as HTMLElement
      const body = ros.querySelector('.ros-body') as HTMLElement
      const top = document.querySelector('.sb-top') as HTMLElement
      const r = ros.getBoundingClientRect(), t = top.getBoundingClientRect()
      return {
        drawerTop: Math.round(r.top), barBottom: Math.round(t.bottom),
        width: Math.round(r.width), vw: window.innerWidth,
        scrollable: body.scrollHeight > body.clientHeight,
        canScroll: getComputedStyle(body).overflowY,
      }
    })
    expect(m.drawerTop, 'the drawer clears the bar instead of painting over it')
      .toBeGreaterThanOrEqual(m.barBottom - 1)
    expect(m.width / m.vw, 'and it is thinner than it was — 64% of the width, not 78%')
      .toBeLessThanOrEqual(0.66)
    expect(m.canScroll, 'the crew list scrolls on its own').toBe('auto')
  })
})

/* ===================================================================
   HISTORY (owner, 11 Aug 26) — the bubble that says who changed a
   detail, and when. Every number here is 0 in jsdom, which is the whole
   reason this belongs in this file: src/ui/histbubble.test.tsx can prove
   which element was emitted and what it says, and nothing about where it
   landed or whether it fits.
   =================================================================== */
test.describe('the History bubble', () => {
  /* History on, one real edit made, and the bubble raised over its own cell.
     Returns the two rectangles so each test can ask its own question. */
  async function raise(page: Page) {
    await page.evaluate(() => (window as any).openScheduler(0))
    await page.waitForSelector('#sbHist')
    const key = await page.evaluate(() => {
      const w = window as any
      const el = [...document.querySelectorAll('#sbBoard [data-slot]')]
        .find(e => /\.[pw]$/.test((e as HTMLElement).dataset.slot || '') && w.slotVal((e as HTMLElement).dataset.slot))
      const k = (el as HTMLElement).dataset.slot
      w.setSlotVal(k, w.slotVal(k) === 'bane' ? 'stiff' : 'bane')
      return k
    })
    await page.click('#sbHist')
    await page.waitForTimeout(250)
    const cell = page.locator(`#sbBoard [data-slot="${key}"]`).first()
    /* the gesture the surface actually uses — a phone taps, a desktop hovers */
    if (page.viewportSize()!.width <= 820) await cell.click()
    else await cell.hover()
    await page.waitForTimeout(250)
    return page.evaluate(k => {
      const b = document.querySelector('.histbub') as HTMLElement
      const c = document.querySelector(`#sbBoard [data-slot="${k}"]`) as HTMLElement
      if (!b) return null
      const r = b.getBoundingClientRect(), cr = c.getBoundingClientRect()
      return {
        l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom),
        w: Math.round(r.width), h: Math.round(r.height),
        cellTop: Math.round(cr.top), cellBottom: Math.round(cr.bottom),
        vw: window.innerWidth, vh: window.innerHeight,
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        pe: getComputedStyle(b).pointerEvents,
        text: (b.textContent || '').trim(),
      }
    }, key)
  }

  for (const c of [{ label: 'phone', vp: PHONE }, { label: 'desktop', vp: { width: 1440, height: 900 } }]) {
    test(`${c.label}: it fits on screen and never pushes the page sideways`, async ({ page }) => {
      await page.setViewportSize(c.vp)
      await login(page)
      await go(page, 'editsched')
      const m = await raise(page)
      expect(m, 'the bubble came up at all').not.toBe(null)
      expect(m!.text, 'and it says something').not.toBe('')
      expect(m!.l, 'not off the left edge').toBeGreaterThanOrEqual(0)
      expect(m!.r, 'not off the right edge').toBeLessThanOrEqual(m!.vw)
      expect(m!.t, 'not above the top').toBeGreaterThanOrEqual(0)
      expect(m!.b, 'not below the bottom').toBeLessThanOrEqual(m!.vh)
      expect(m!.pageOverflow, 'and the board gains no sideways scroll from it').toBeLessThanOrEqual(0)
      /* THE ONE THAT MATTERS ON A PHONE. The bubble is raised by the same tap
         that arms the seat and opens the keyboard on a text field; anything it
         could intercept would make History a mode that stops the board
         working. pointer-events:none is what guarantees it, and it is a CSS
         value, so only a browser can read it back. */
      expect(m!.pe, 'it cannot take a tap from the cell underneath').toBe('none')
      /* above the cell, not on top of it — the thing being explained has to
         stay visible while its explanation is up */
      expect(m!.b, 'it sits clear of the cell it describes').toBeLessThanOrEqual(m!.cellTop + 1)
    })
  }

  /* THE BUBBLE IS UNDER EVERY BOX THAT CAN OPEN OVER IT (11 Aug 26).
     It was z-index 500, above the lot, and on a phone it stays up for four
     seconds after the tap that raised it — so tapping a detail and then
     opening any dialog left the bubble sitting on top of that dialog. It was
     found once, with the changes list, and patched there with an explicit
     hide; the other seven boxes still had it. The fix is the stacking, which
     covers all of them at once and cannot drift the way a list of hide calls
     would. Only a browser can read a computed z-index back, so this is the
     one place it can be held. */
  test('desktop: it stacks under every dialog that can open over the board', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await login(page)
    await go(page, 'editsched')
    const m = await raise(page)
    expect(m, 'the bubble came up at all').not.toBe(null)

    const z = await page.evaluate(() => {
      const num = (sel: string) => {
        const el = document.querySelector(sel) as HTMLElement
        return el ? parseInt(getComputedStyle(el).zIndex, 10) : NaN
      }
      /* the dialogs are not all on screen, so read the RULES rather than live
         elements — a stylesheet walk is what makes this independent of which
         box happens to be open */
      const want: any = {}
      for (const sheet of [...document.styleSheets]) {
        let rules: any[] = []
        try { rules = [...(sheet as CSSStyleSheet).cssRules] } catch (_) { continue }
        for (const r of rules as any[]) {
          if (!r.selectorText || !r.style || !r.style.zIndex) continue
          for (const s of ['.histbub', '.drawer', '.airpop', '.modal', '.wavemenu', '.schedboard'])
            if (r.selectorText.split(',').map((x: string) => x.trim()).includes(s))
              want[s] = parseInt(r.style.zIndex, 10)
        }
      }
      return { ...want, live: num('.histbub') }
    })

    expect(z.live, 'the live bubble carries the rule').toBe(z['.histbub'])
    expect(z['.histbub'], 'above the board it anchors to').toBeGreaterThan(z['.schedboard'])
    for (const over of ['.drawer', '.airpop', '.modal', '.wavemenu'])
      expect(z['.histbub'], `below ${over}, which can open over it`).toBeLessThan(z[over])
  })
})

/* ===================================================================
   THE PAGE BEHIND THE BOARD DOES NOT MOVE (owner-reported, 11 Aug 26 —
   "I could scroll and see the edit schedule board leaking into it, and in
   the end I was controlling the edit schedule board view at the bottom").
   The board is a fixed full-viewport modal over a week that is 3600px of
   live scrolling document. Two holes let a finger reach it: .sb-main had
   no overscroll-behavior, so a swipe that hit the end of the board CHAINED
   to the page; and the bar is in no scroller at all, so a drag there went
   straight to the document. Measured before the fix, and on the build
   before History: 2400px of page scrolled away under an open board.
   jsdom cannot see any of this — it has no scrolling, no chaining and no
   computed overscroll-behavior — so this is the only place it can be held.
   =================================================================== */
test.describe('the board holds the page still underneath it', () => {
  for (const c of [{ label: 'phone', vp: PHONE }, { label: 'desktop', vp: { width: 1440, height: 900 } }]) {
    test(`${c.label}: scrolling past the end of the board does not drive the week behind it`, async ({ page }) => {
      await page.setViewportSize(c.vp)
      await login(page)
      await go(page, 'editsched')
      /* park the page somewhere real first: "it went back to the top" would
         be a worse fault than the one being fixed, so the restore is part of
         the contract, not an implementation detail */
      await page.evaluate(() => { document.scrollingElement!.scrollTop = 700 })
      await page.waitForTimeout(200)
      const parked = await page.evaluate(() => Math.round(document.scrollingElement!.scrollTop))
      expect(parked, 'the page really was scrollable to begin with').toBeGreaterThan(0)

      await page.evaluate(() => (window as any).openScheduler(0))
      await page.waitForSelector('#sbHist')
      await page.waitForTimeout(300)

      /* the exact gesture that did it: run the board's own scroller to its
         very end, then keep going */
      await page.evaluate(() => {
        const m = document.querySelector('.sb-main') as HTMLElement
        m.scrollTop = m.scrollHeight
      })
      await page.waitForTimeout(200)
      await page.mouse.move(c.vp.width / 2, c.vp.height / 2)
      for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(100) }
      await page.waitForTimeout(300)

      const during = await page.evaluate(() => ({
        y: Math.round(document.scrollingElement!.scrollTop),
        mainAtEnd: (() => { const m = document.querySelector('.sb-main') as HTMLElement
          return m.scrollTop >= m.scrollHeight - m.clientHeight - 2 })(),
        contain: getComputedStyle(document.querySelector('.sb-main') as HTMLElement).overscrollBehaviorY,
        scrolls: (() => { const m = document.querySelector('.sb-main') as HTMLElement
          return m.scrollHeight > m.clientHeight + 2 })(),
        locked: getComputedStyle(document.body).overflow,
      }))
      expect(during.mainAtEnd, 'the board scroller really did reach its end').toBe(true)
      /* containment only means anything where that scroller actually scrolls,
         which is the PHONE layout — on a desktop .sb-main is a fixed-height
         row and the panels scroll inside it, so there is no chain to break
         and the body lock below is the whole defence. Asserting `contain`
         there would pin a value that does nothing. */
      if (during.scrolls) expect(during.contain, 'the one scroller contains its own overscroll').not.toBe('auto')
      expect(during.locked, 'while the page itself is held').toBe('hidden')
      expect(during.y, 'so the week behind has not moved a pixel').toBe(parked)

      /* and closing hands the page back exactly where it was */
      await page.click('#sbClose')
      await page.waitForTimeout(400)
      const after = await page.evaluate(() => ({
        y: Math.round(document.scrollingElement!.scrollTop),
        overflow: getComputedStyle(document.body).overflow,
      }))
      expect(after.overflow, 'the lock comes off with the board').not.toBe('hidden')
      expect(after.y, 'and the page is where it was left').toBe(parked)
    })
  }
})

/* ===================================================================
   THE CHANGES LIST'S TWO WAYS IN, AND THE DAY CAROUSEL (owner, 11 Aug 26).
   Both are questions only a browser can answer. The entry points are chosen
   by a MEDIA QUERY — both are rendered and CSS shows one — which jsdom
   resolves as nothing at all; and the carousel is a transform driven by a
   pointer, where jsdom has neither layout nor a compositor.
   =================================================================== */
test.describe('the way into the changes list follows the width', () => {
  for (const c of [
    { label: 'desktop', vp: { width: 1440, height: 900 }, top: true },
    { label: 'phone', vp: PHONE, top: false },
  ]) {
    test(`${c.label}: exactly one entry is on screen, and it is the right one`, async ({ page }) => {
      await page.setViewportSize(c.vp)
      await login(page)
      await go(page, 'editsched')
      await page.evaluate(() => (window as any).openScheduler(0))
      await page.waitForSelector('#sbHist')
      await page.click('#sbHist')                       // History on
      await page.waitForTimeout(250)

      const m = await page.evaluate(() => {
        const vis = (s: string) => {
          const e = document.querySelector(s) as HTMLElement
          if (!e) return 'absent'
          const r = e.getBoundingClientRect()
          return getComputedStyle(e).display === 'none' ? 'hidden'
            : (r.width > 0 && r.height > 0 ? 'shown' : 'zero')
        }
        const t = document.querySelector('#sbBoard .histln-top') as HTMLElement
        const sign = document.querySelector('#sbSignBar') as HTMLElement
        return {
          top: vis('#sbBoard .histln-top'), panel: vis('#sbWarn .histln'),
          /* the ask was ABOVE the sign-off section, so measure it */
          topAboveSign: !!(t && sign) && Math.round(t.getBoundingClientRect().bottom)
            <= Math.round(sign.getBoundingClientRect().top) + 1,
          bothRendered: !!document.querySelector('.histln-top') && !!document.querySelector('.histln'),
        }
      })
      expect(m.bothRendered, 'both are in the markup — CSS picks').toBe(true)
      expect(m.top).toBe(c.top ? 'shown' : 'hidden')
      expect(m.panel).toBe(c.top ? 'hidden' : 'shown')
      if (c.top) expect(m.topAboveSign, 'and it sits above the sign-off bar').toBe(true)
    })
  }
})

/* ===================================================================
   THE DAY IS STEPPED BY TWO ARROWS (owner, 12 Aug 26 — "remove the swipe for
   the mobile scheduler board too. Just put arrows at the edges of the bar at
   the top to navigate left and right between days").
   This block replaces the day-carousel suite entirely: the swipe, its preview
   pane and every measurement of its motion are gone. What a browser is still
   needed for is WHERE the arrows are (jsdom has no layout, so it cannot tell an
   arrow at the screen's edge from one in the middle of the bar), that they cost
   the bar no second row, and that a drag across the board now does nothing.
   =================================================================== */
test.describe('the day arrows', () => {
  test('phone: they sit at the two edges of the day row, and the bar stays one line', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await login(page)
    await go(page, 'editsched')
    await page.evaluate(() => (window as any).openScheduler(2))
    await page.waitForSelector('#sbPrevDay')

    const m = await page.evaluate(() => {
      const top = document.querySelector('.sb-top') as HTMLElement
      const prev = document.querySelector('#sbPrevDay') as HTMLElement
      const next = document.querySelector('#sbNextDay') as HTMLElement
      const dots = document.querySelector('#sbDays') as HTMLElement
      const r = (e: HTMLElement) => e.getBoundingClientRect()
      const acts = [...document.querySelectorAll('.sb-actions > .abtn, .sb-actions > select')] as HTMLElement[]
      return {
        barH: Math.round(r(top).height),
        prevLeft: Math.round(r(prev).left),
        nextRight: Math.round(window.innerWidth - r(next).right),
        prevW: Math.round(r(prev).width), prevH: Math.round(r(prev).height),
        /* the arrows are on their OWN line, under the title and the buttons */
        arrowsBelowActions: Math.round(r(prev).top) >= Math.round(r(acts[0]).bottom),
        sameLine: Math.round(r(prev).top) === Math.round(r(next).top),
        /* and the dots are still between them, not pushed off */
        dotsBetween: Math.round(r(dots).left) >= Math.round(r(prev).right)
          && Math.round(r(dots).right) <= Math.round(r(next).left),
        overflow: top.scrollWidth - top.clientWidth,
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }
    })
    expect(m.prevLeft, 'the previous arrow is against the left edge').toBeLessThanOrEqual(10)
    expect(m.nextRight, 'and the next one against the right').toBeLessThanOrEqual(10)
    expect(m.sameLine, 'both on the same line').toBe(true)
    expect(m.arrowsBelowActions, 'on the day row, below the title and the buttons').toBe(true)
    expect(m.dotsBetween, 'with the seven dots still between them').toBe(true)
    expect(m.overflow, 'nothing is clipped or pushed off the bar').toBeLessThanOrEqual(0)
    expect(m.pageOverflow, 'and the board gains no sideways scrollbar').toBeLessThanOrEqual(0)
    /* a real target, not a hairline: 40x26 is a bigger area than the 30x30 the
       action buttons get, and wider than tall because horizontal room is what
       this row has and a thumb at the screen edge is more accurate sideways */
    expect(m.prevW).toBeGreaterThanOrEqual(36)
    expect(m.prevH).toBeGreaterThanOrEqual(24)
    /* THE PRICE OF THE ARROWS, measured: the bar was 70px with the dots alone
       and is 80px with a 26px control on that row. Still less than half the
       166px of four stacked rows it replaced, and the bound stays under the
       ~100px a second row of 30px buttons would cost, which is the regression
       this number exists to catch. */
    expect(m.barH, 'the arrows cost the bar 10px and no second row').toBeLessThan(86)
  })

  test('phone: tapping them steps the day, and they stop at both ends of the week', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await login(page)
    await go(page, 'editsched')
    await page.evaluate(() => (window as any).openScheduler(0))
    await page.waitForSelector('#sbPrevDay')
    expect(await page.locator('#sbPrevDay').isDisabled(), 'Monday has no day before it').toBe(true)
    for (let i = 1; i <= 6; i++) {
      await page.click('#sbNextDay')
      await page.waitForTimeout(120)
      expect(await page.evaluate(() => (window as any).SBDAY)).toBe(i)
    }
    expect(await page.locator('#sbNextDay').isDisabled(), 'and Sunday has none after it').toBe(true)
    await page.click('#sbPrevDay')
    await page.waitForTimeout(120)
    expect(await page.evaluate(() => (window as any).SBDAY)).toBe(5)
    /* the day really is redrawn, not just the title: every board address starts
       with the day index */
    expect(await page.evaluate(() =>
      document.querySelector('#sbBoard [data-slot]')!.getAttribute('data-slot')!.replace(/^[a-z]+:/, '').split('.')[0])).toBe('5')
  })

  test('desktop: the arrows are not drawn, because all seven days are on the bar', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await login(page)
    await go(page, 'editsched')
    await page.evaluate(() => (window as any).openScheduler(2))
    await page.waitForSelector('#sbDays [data-sbtab]')
    expect(await page.locator('#sbPrevDay').isVisible()).toBe(false)
    expect(await page.evaluate(() => (document.querySelector('#sbDays') as HTMLElement).getBoundingClientRect().height > 0),
      'and the chips are still there').toBe(true)
  })

  /* THE SWIPE IS GONE, on the surface it was built for (owner, 12 Aug 26). The
     scroller is an ordinary one again: no `touch-action` of its own, no preview
     pane, and a sideways drag leaves the day alone. */
  test('phone: a sideways drag across the board does nothing at all', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await login(page)
    await go(page, 'editsched')
    await page.evaluate(() => (window as any).openScheduler(2))
    await page.waitForSelector('#sbPrevDay')
    await page.evaluate(() => { (document.querySelector('.sb-main') as HTMLElement).scrollTop = 400 })
    await page.waitForTimeout(150)
    const y0 = await page.evaluate(() => (document.querySelector('.sb-main') as HTMLElement).scrollTop)

    const box = (await page.locator('.sb-main').boundingBox())!
    const cy = box.y + box.height / 2
    await page.mouse.move(box.x + 340, cy)
    await page.mouse.down()
    for (const x of [300, 250, 200, 150, 90]) { await page.mouse.move(box.x + x, cy); await page.waitForTimeout(25) }
    const mid = await page.evaluate(() => ({
      pane: !!document.querySelector('.sb-pane'),
      tx: getComputedStyle(document.querySelector('.sb-main') as HTMLElement).transform,
    }))
    await page.mouse.up()
    await page.waitForTimeout(500)

    expect(mid.pane, 'no preview is built mid-drag').toBe(false)
    expect(mid.tx, 'and the board never moves with the finger').toBe('none')
    expect(await page.evaluate(() => (window as any).SBDAY), 'the day is unchanged').toBe(2)
    expect(await page.evaluate(() => (document.querySelector('.sb-main') as HTMLElement).scrollTop),
      'and the vertical position it was left at held').toBe(y0)
  })
})
