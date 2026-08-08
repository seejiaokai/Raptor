/* The measured layout contracts from docs/ui-contracts.md §Rendering.

   These are the ones the note in that file calls "measured, suite-enforced"
   — and until now they were enforced only by hand, because jsdom has no
   layout engine: every rect in Vitest is 0x0, so a puck that had silently
   grown to 90px, or free text that had started overflowing its cell, would
   pass `npm test` all day. Here they run in a real browser on the real
   production build, so a CSS change that breaks one fails a gate. */
import { expect, test } from '@playwright/test'
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

    await page.click('#editToggle'); await page.waitForTimeout(350)
    expect(await settle(page, '#eWeek'), 'and so does the Edit-mode toggle').toBe(before)
    expect(await page.evaluate(() => !!document.querySelector('#eWeek [contenteditable="true"]')),
      'Edit mode OFF really is read-only').toBe(false)
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
  expect(n, 'nine grid items — .sb-rcell must be exactly one').toBe(9)
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
   bug — "three of four passing" is what let it through. */
test('the board\'s flying line is single-row in .sb-wide at phone width, and stays 9 grid items throughout', async ({ page }) => {
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
    expect(m.children, `${c.label}: nine grid items — .sb-rcell must be exactly one`).toBe(9)
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
