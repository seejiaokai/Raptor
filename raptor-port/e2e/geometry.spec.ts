/* The measured layout contracts from docs/ui-contracts.md §Rendering.

   These are the ones the note in that file calls "measured, suite-enforced"
   — and until now they were enforced only by hand, because jsdom has no
   layout engine: every rect in Vitest is 0x0, so a puck that had silently
   grown to 90px, or free text that had started overflowing its cell, would
   pass `npm test` all day. Here they run in a real browser on the real
   production build, so a CSS change that breaks one fails a gate. */
import { expect, test } from '@playwright/test'
import { go, login, pan, puckSize, scrollTo, settle, settleBoth } from './app'

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

    /* find a flagged day that is NOT the leftmost one, then scroll away from
       it — otherwise "it is in view" proves nothing, it was never out of view */
    const di = await page.evaluate(() => {
      const days = [...document.querySelectorAll('#vWeek .day[data-day]')]
      const hit = days.find(d => d.querySelector('.daywarn[data-daywarn]') && +(d as HTMLElement).dataset.day! > 1)
      return hit ? +(hit as HTMLElement).dataset.day! : -1
    })
    test.skip(di < 0, 'no flagged day far enough into the week to scroll away from')

    await scrollTo(page, '#vWeek', 0)
    await page.click(`#vWeek .day[data-day="${di}"] .daywarn[data-daywarn]`)
    await page.waitForSelector(`#vWeek .day[data-day="${di}"] .witem[data-wdi]`)
    await scrollTo(page, '#vWeek', 0)          // the expand may have nudged it

    await page.click(`#vWeek .day[data-day="${di}"] .witem[data-wdi]`)
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
})
