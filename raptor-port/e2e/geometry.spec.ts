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
