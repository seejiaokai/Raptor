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

    test(`the ARMED palette's struck entries keep the puck 74x15 on ${name}`, async ({ page }) => {
      /* .rpuck.no.haswhy is a COLUMN flex container (reason printed under the
         name), and the shared `.rpuck .puck` rule pins flex-basis to --puck-w
         — which in a column governs HEIGHT, so every struck entry drew a
         74x74 grey slab (owner, 14 Aug 26). Only a real layout engine can see
         it: jsdom proves which class was emitted, not what it painted. */
      await page.setViewportSize(viewport)
      await login(page)
      await go(page, 'editsched')
      /* arm through a programme row's append cell — Monday's seed has every
         flying seat crewed, and this arm bars enough names to draw .haswhy */
      await page.evaluate(() => {
        (document.querySelector('#eWeek [data-fill^="a:0"]') as HTMLElement).click()
      })
      await expect(page.locator('#eRoster .ros-arm')).toBeVisible()
      const struck = page.locator('#eRoster .rpuck.no.haswhy')
      expect(await struck.count(), 'this arm drew struck entries with reasons').toBeGreaterThan(0)
      const want = await puckSize(page)
      const odd = await page.evaluate(([w, h]) => [...document.querySelectorAll('#eRoster .rpuck .puck')]
        .map(el => { const r = el.getBoundingClientRect(); return { w: +r.width.toFixed(1), h: +r.height.toFixed(1) } })
        .filter(r => r.w !== w || r.h !== h).slice(0, 4), [want.w, want.h] as const)
      expect(odd, 'every armed-palette puck is exactly --puck-w x --puck-h').toEqual([])
      /* and the armed list carries no day-wide fade — a name is either normal
         (plannable) or struck with its reason (owner, 14 Aug 26) */
      expect(await page.locator('#eRoster .rpuck.busy, #eRoster .rpuck.standby').count()).toBe(0)
    })
  }

  for (const [name, viewport] of [['phone', PHONE], ['desktop', DESK]] as const) {
    test(`the SANS Availability palette section holds its geometry on ${name}`, async ({ page }) => {
      /* The .rall.rsans band (14 Aug 26) lists every SANS member with an
         F/O/A-style badge as a SIBLING of the .rpuck — never nested inside
         it, because .rpuck.no.haswhy is a flex COLUMN and a nested child
         would ride the 74x74 flex-basis trap the armed-palette test above
         pins. jsdom proves the markup shape; only a real layout engine can
         prove the badge does not distort the puck or run the row sideways. */
      await page.setViewportSize(viewport)
      await login(page)
      await go(page, 'editsched')
      const want = await puckSize(page)

      /* the section exists, the old per-column sub-bands are gone */
      await expect(page.locator('#eRoster .rall.rsans')).toHaveCount(1)
      expect(await page.locator('#eRoster .rcol .rh.sans').count()).toBe(0)
      expect(await page.locator('#eRoster .rall.rsans .rpuck .puck').count()).toBeGreaterThan(0)

      /* RECORD-LESS SANS ARE STRUCK BY DEFAULT, WITH NOTHING ARMED (owner bug
         report, 14 Aug 26) — the seed week files no SANS record for Monday,
         so every one of the eleven SANS bodies here should already read
         .rpuck.no with no slot armed at all: the title carries the reason,
         and no .rwhy is printed (that is an ARMED-only affordance — a phone
         has no hover, but there is also no slot yet to be refused from). */
      const unarmedStruck = page.locator('#eRoster .rall.rsans .rpuck.no')
      expect(await unarmedStruck.count(), 'record-less SANS strike with nothing armed').toBeGreaterThan(0)
      expect(await page.locator('#eRoster .rall.rsans .rpuck.no .rwhy').count(), 'no printed reason while unarmed').toBe(0)
      expect(await unarmedStruck.first().getAttribute('title') || '')
        .toContain('SANS — no availability filed for today')

      /* file a record through the probe bridge — NEW shape (owner rework, 14
         Aug 26): one offered window on the row's own allday/s/e fields, and
         `sans` reduced to which events are ticked. The letters+window badge
         must appear beside the puck, filing it must clear the unarmed
         strike, and none of it may touch the puck's size or overflow the row. */
      await page.evaluate(() => {
        const w = window as any
        w.INPUTS.unshift({ person: 'vinci', date: 'Jul 13', allday: false, s: 480, e: 720,
          type: 'SANS Availability', sans: { f: true, o: true },
          iid: 'e2e-sans', mod: 'now' })
        w.afterSchedMutate(); w.renderEditWeek()
      })
      const badge = page.locator('#eRoster .rsans-row:has([data-person="vinci"]) .rsans-b')
      await expect(badge).toHaveText('F/O · 08:00–12:00')
      const vinciCls = await page.locator('#eRoster .rall.rsans .rpuck[data-person="vinci"]').getAttribute('class')
      expect(vinciCls || '', 'filing a record clears the unarmed strike').not.toMatch(/\bno\b/)
      const geo = await page.evaluate(([w, h]) => {
        const row = document.querySelector('#eRoster .rsans-row [data-person="vinci"]')!.closest('.rsans-row') as HTMLElement
        const puck = row.querySelector('.puck')!.getBoundingClientRect()
        const b = row.querySelector('.rsans-b')!.getBoundingClientRect()
        return { pw: +puck.width.toFixed(1), ph: +puck.height.toFixed(1),
          besides: b.left >= puck.right, spill: row.scrollWidth - row.clientWidth }
      }, [want.w, want.h] as const)
      expect(geo.pw, 'the badge does not resize the puck').toBe(want.w)
      expect(geo.ph).toBe(want.h)
      expect(geo.besides, 'the badge sits beside the puck, not on it').toBe(true)
      expect(geo.spill, 'the row does not run sideways').toBeLessThanOrEqual(0)

      /* widen the offer to ALL DAY before arming — the ONE window covers
         every ticked event now (rework, 14 Aug 26), so the 08:00–12:00
         window the badge check above used would legitimately print
         "available … only" against an OFT box running outside it; "covering"
         means the record's window covers the slot, not the old per-event
         all-day flag */
      await page.evaluate(() => {
        const w = window as any
        const rec = w.INPUTS.find((x: any) => x.iid === 'e2e-sans')
        rec.allday = true; delete rec.s; delete rec.e
        w.afterSchedMutate(); w.renderEditWeek()
      })

      /* arm an OFT row through its append cell (the week draws no empty sim
         seat cell — a missing crewman simply is not there, so the append cell
         is the armable address, same as the armed-palette test above uses
         a:0): record-less SANS entries strike with a printed SANS reason, the
         record covering OFT does not, and every puck in the section keeps its
         size through the .haswhy column swap */
      await page.evaluate(() => {
        (document.querySelector('#eWeek [data-fill="s:0.oft.3.+"]') as HTMLElement).click()
      })
      await expect(page.locator('#eRoster .ros-arm')).toBeVisible()
      const struck = page.locator('#eRoster .rall.rsans .rpuck.no.haswhy')
      expect(await struck.count(), 'record-less SANS entries strike').toBeGreaterThan(0)
      expect((await struck.first().locator('.rwhy').textContent()) || '').toMatch(/^SANS/)
      const vinciWhy = await page.evaluate(() => {
        const rp = document.querySelector('#eRoster .rall.rsans .rpuck[data-person="vinci"]') as HTMLElement
        return (rp.querySelector('.rwhy')?.textContent) || ''
      })
      expect(vinciWhy, 'an offer covering OFT raises no SANS reason').not.toMatch(/^SANS/)
      const odd = await page.evaluate(([w, h]) => [...document.querySelectorAll('#eRoster .rall.rsans .rpuck .puck')]
        .map(el => { const r = el.getBoundingClientRect(); return { w: +r.width.toFixed(1), h: +r.height.toFixed(1) } })
        .filter(r => r.w !== w || r.h !== h).slice(0, 4), [want.w, want.h] as const)
      expect(odd, 'every SANS-section puck is exactly --puck-w x --puck-h while armed').toEqual([])
    })

    test(`the SANS Availability card grid holds its geometry on ${name}`, async ({ page }) => {
      /* The week's SANS group (owner rework, 14 Aug 26) draws a compact CSS
         grid of cards instead of a row per record — the point is 26 filed
         offers reading as 2-3 rows of cards, not 26 full-width rows.
         auto-fill decides the column count at any width, so read it straight
         off the computed style rather than re-deriving it from card rects. */
      await page.setViewportSize(viewport)
      await login(page)
      await go(page, 'editsched')
      await page.evaluate(() => {
        const w = window as any, dt = 'Jul 13'
        const recs = [
          { person: 'ipman', date: dt, allday: true, type: 'SANS Availability', sans: { f: true }, mod: 'now' },
          { person: 'romeo', date: dt, allday: true, type: 'SANS Availability', sans: { o: true }, mod: 'now' },
          { person: 'nick', date: dt, allday: false, half: 'am', type: 'SANS Availability', sans: { a: true }, mod: 'now' },
          { person: 'waldo', date: dt, allday: false, half: 'pm', type: 'SANS Availability', sans: { f: true, o: true }, mod: 'now' },
        ]
        recs.forEach((r: any) => w.INPUTS.unshift(r))
        w.afterSchedMutate(); w.renderEditWeek()
      })
      const grid = page.locator('#eWeek .sec-sans .sanscards').first()
      await expect(grid).toBeVisible()
      expect(await grid.locator('.sanscard').count()).toBeGreaterThanOrEqual(4)
      const cols = await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)
      expect(cols, `${name}: at least ${name === 'desktop' ? 3 : 2} SANS cards to a row`)
        .toBeGreaterThanOrEqual(name === 'desktop' ? 3 : 2)
      const pageOver = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(pageOver, 'the SANS card grid causes no horizontal document overflow').toBeLessThanOrEqual(0)
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
  await page.waitForSelector('#schedBoard .sb-arow .ain')

  const m = await page.evaluate(() => {
    /* the ROLE/ITEM boxes only — NOT `.rmkin`, which rides the pucks' row and
       holds arbitrarily long text (owner, 16 Aug 26), so it must not be read
       as the ITEM column being crushed.
       TAG-AGNOSTIC since 20 Aug 26, and that matters more than it looks: these
       were `input.ain` until the wrapping pass made them textareas, at which
       point the selector matched NOTHING, `named` came back empty and the
       `test.skip` below fired — so this gate quietly stopped running instead
       of failing. Do not put a tag back into it. */
    const ins = [...document.querySelectorAll('#schedBoard .sb-arow.c6r .ain:not(.rmkin)')] as HTMLTextAreaElement[]
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
  /* FOUR since 20 Aug 26 — the remarks-alignment spacer track; see the
     column-layout test further down. The point of this assertion is that the
     DESKTOP six-track template is not winning here, which it still makes. */
  expect(m!.columns, 'the phone template is not the desktop six').toBe(4)
  expect(m!.worstOverflow, 'the item name is not clipped by its own box').toBeLessThanOrEqual(0)
  expect(m!.narrowest, 'and the item column is actually readable').toBeGreaterThan(80)
})

/* EVERY REMARKS BOX RIDES THE PUCKS' ROW, AT ALL TIMES (owner, 16 Aug 26 —
   "beside the pucks on the right, same row, aligned with the B"). The phone
   board used to HIDE an empty remarks box on a c6r row and reveal one at a
   time behind a "+"; the owner asked for every box to show, sharing the pucks'
   row where it costs no extra line. Only a real browser can prove the box is
   drawn beside the pucks (not below), overlapping their row band and sitting
   to their right — jsdom reports every rect as 0×0. */
test('phone: the remarks box shares the pucks row, to their right, with no + reveal', async ({ page }) => {
  await page.setViewportSize(PHONE)
  await login(page)
  await go(page, 'editsched')
  await page.evaluate(() => (window as any).openScheduler(0))
  const row = '#schedBoard .sb-panel.duty [data-move="mv:d.0.0.0"]'
  await page.waitForSelector(`${row} .rmkin`, { state: 'visible' })

  const m = await page.evaluate((sel) => {
    const r = document.querySelector(sel) as HTMLElement
    const box = r.querySelector('.rmkin') as HTMLElement
    const ppl = r.querySelector('.ppl') as HTMLElement
    const b = box.getBoundingClientRect(), p = ppl.getBoundingClientRect()
    /* two bands overlap vertically when neither sits entirely below the other */
    const sameRow = b.top < p.bottom && p.top < b.bottom
    return {
      boxShown: b.height > 0 && getComputedStyle(box).display !== 'none',
      anyReveal: !!document.querySelector('#schedBoard [data-rmkadd]'),
      sameRow,
      toTheRight: b.left >= p.left + p.width - 1,   // remarks starts at or past the pucks' right edge
    }
  }, row)
  expect(m.boxShown, 'the empty box is drawn, not hidden').toBe(true)
  expect(m.anyReveal, 'the reveal + is gone from the whole board').toBe(false)
  expect(m.sameRow, 'the remarks box rides the same row as the pucks').toBe(true)
  expect(m.toTheRight, 'and sits to the right of them').toBe(true)
})

test('desktop: every remarks box stays put, empty or not, with no reveal button anywhere', async ({ page }) => {
  await page.setViewportSize(DESK)
  await login(page)
  await go(page, 'editsched')
  await page.evaluate(() => (window as any).openScheduler(0))
  await page.waitForSelector('#schedBoard .sb-arow.c6r .rmkin')

  const m = await page.evaluate(() => {
    const boxes = [...document.querySelectorAll('#schedBoard .sb-arow.c6r .rmkin')] as HTMLElement[]
    return {
      total: boxes.length,
      hiddenBoxes: boxes.filter(b => getComputedStyle(b).display === 'none').length,
      anyReveal: document.querySelectorAll('#schedBoard [data-rmkadd]').length,
    }
  })
  expect(m.total, 'the seed day has c6r rows to check').toBeGreaterThan(0)
  expect(m.hiddenBoxes, 'desktop has the width for every remarks box, empty or not').toBe(0)
  expect(m.anyReveal, 'and never shows the retired reveal control').toBe(0)
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

/* THE DESKTOP SCHEDULER-BOARD CHROME IS TIGHT (owner, 26 Aug 26 — a batch of
   "give me more working space" asks). Four things at once, all jsdom-invisible
   because they are height/row/border geometry: the action buttons match the
   shell topbar's compact height (they were 44px — a flex row stretching to the
   tallest child, which stacked an icon over its label); the CAT/Type/Quals
   strip shares the action row instead of taking a line of its own; those tabs
   carry NO bottom border (the History accordion's `.hl-grp` border used to
   bleed onto them); and the sign-off scrolls away because `.sb-boardwrap` is
   the scroller now, not `#sbBoard`. The desktop-only hides on the ‹ › arrows
   and the wide button must survive the compact-button rule. */
test('desktop: the scheduler-board chrome is tight — compact buttons on one action row, clean tabs', async ({ page }) => {
  await page.setViewportSize(DESK)
  await login(page)
  await go(page, 'editsched')
  const shellH = await page.evaluate(() => {
    const b = document.querySelector('.topbar .abtn') as HTMLElement
    return b ? Math.round(b.getBoundingClientRect().height) : 28
  })
  await page.evaluate(() => (window as any).openScheduler(0))
  await page.waitForSelector('#sbClose')
  const m = await page.evaluate(() => {
    const shown = (el: Element | null) => !!el && getComputedStyle(el).display !== 'none'
    const top = (el: Element | null) => el ? Math.round(el.getBoundingClientRect().top) : null
    const actions = [...document.querySelectorAll('.sb-actions .abtn')]
      .filter(el => getComputedStyle(el).display !== 'none') as HTMLElement[]
    return {
      maxBtnH: Math.max(...actions.map(el => Math.round(el.getBoundingClientRect().height))),
      hlY: top(document.querySelector('.sb-hl')),
      actionsY: top(document.querySelector('.sb-actions')),
      /* the strip opens the SECOND line, below the calendar and left-aligned
         with it (owner, 26 Aug 26, the arrow drawing): .sb-break forces the
         wrap, so this holds at ANY width — before it, a wide screen kept the
         strip on line 1 because it happened to fit there */
      calBottom: Math.round(document.querySelector('#sbCal')!.getBoundingClientRect().bottom),
      calX: Math.round(document.querySelector('#sbCal')!.getBoundingClientRect().left),
      hlX: Math.round(document.querySelector('.sb-hl')!.getBoundingClientRect().left),
      tabBorders: [...document.querySelectorAll('.sb-hl .hl-grp')].map(el => getComputedStyle(el).borderBottomWidth),
      arrowsShown: shown(document.querySelector('.sb-nav .sb-arrow')),
      wideShown: shown(document.querySelector('.sb-widebtn')),
      boardwrapOY: getComputedStyle(document.querySelector('.sb-boardwrap')!).overflowY,
      boardOverflow: getComputedStyle(document.querySelector('#sbBoard')!).overflow,
    }
  })
  expect(m.maxBtnH, 'board action buttons match the shell topbar height').toBeLessThanOrEqual(shellH + 4)
  expect(Math.abs((m.hlY ?? 0) - (m.actionsY ?? 9999)), 'the highlight strip sits on the action row').toBeLessThanOrEqual(6)
  expect((m.hlY ?? 0) >= m.calBottom - 2, 'the strip sits BELOW the calendar button — the forced wrap held').toBe(true)
  expect(Math.abs(m.hlX - m.calX), 'and left-aligned under it').toBeLessThanOrEqual(8)
  expect(m.tabBorders.length, 'the three CAT/Type/Quals tabs are present').toBe(3)
  expect(m.tabBorders.every(b => b === '0px'), 'the highlight tabs carry no bottom border').toBe(true)
  expect(m.arrowsShown, 'the ‹ › day arrows stay hidden on desktop').toBe(false)
  expect(m.wideShown, 'the wide-layout button stays hidden on desktop').toBe(false)
  expect(['auto', 'scroll'], 'the board column is the scroller, so the sign-off scrolls away').toContain(m.boardwrapOY)
  expect(m.boardOverflow, 'the inner board no longer scrolls on its own').toBe('visible')

  /* and a click on a ‹ › week arrow drops NO blinking text caret in the chip
     (owner, 26 Aug 26 — the chips are <span> click targets, so without
     user-select:none a tap placed a collapsed selection in the glyph). */
  await page.click('.sb-days .sbweek')
  const caretInChip = await page.evaluate(() => {
    const s = window.getSelection()
    return !!(s && s.anchorNode && (s.anchorNode.parentElement as HTMLElement | null)?.closest('.sbday'))
  })
  expect(caretInChip, 'clicking a week arrow leaves no text caret in the chip').toBe(false)
})

/* THE EDIT-SCHEDULER AIRCREW COLUMN HIDES TO THE RIGHT (owner, 26 Aug 26 — "hide
   the placeholders list on the right of edit scheduler and it just animates to the
   right side"). jsdom proves the class toggles; only a real browser proves the
   column actually leaves the viewport and the week reclaims the freed width. */
test('desktop: the edit-scheduler aircrew column hides to the right and the week reclaims the width', async ({ page }) => {
  await page.setViewportSize(DESK)
  await login(page)
  await go(page, 'editsched')
  await page.waitForSelector('.ros-rail')
  const before = await page.evaluate(() => {
    const w = document.querySelector('.edit-board .week') as HTMLElement
    const e = document.querySelector('.edit-board .eroster') as HTMLElement
    return {
      railShown: getComputedStyle(document.querySelector('.ros-rail')!).display !== 'none',
      weekW: Math.round(w.getBoundingClientRect().width),
      erosterRight: Math.round(e.getBoundingClientRect().right), vw: window.innerWidth,
    }
  })
  expect(before.railShown, 'the hide/show rail is drawn on desktop').toBe(true)
  expect(before.erosterRight, 'the column starts on-screen').toBeLessThanOrEqual(before.vw + 1)

  await page.click('.ros-rail')
  await page.waitForTimeout(350) // the .24s slide settles
  const after = await page.evaluate(() => {
    const w = document.querySelector('.edit-board .week') as HTMLElement
    const e = document.querySelector('.edit-board .eroster') as HTMLElement
    return {
      collapsed: document.body.classList.contains('ros-collapsed'),
      weekW: Math.round(w.getBoundingClientRect().width),
      erosterLeft: Math.round(e.getBoundingClientRect().left), vw: window.innerWidth,
    }
  })
  expect(after.collapsed, 'the class is set').toBe(true)
  expect(after.erosterLeft, 'the column has slid off past the right edge').toBeGreaterThanOrEqual(after.vw - 2)
  expect(after.weekW, 'and the week reclaimed the freed width').toBeGreaterThan(before.weekW + 100)

  await page.click('.ros-rail')
  await page.waitForTimeout(350)
  const back = await page.evaluate(() => ({
    collapsed: document.body.classList.contains('ros-collapsed'),
    weekW: Math.round((document.querySelector('.edit-board .week') as HTMLElement).getBoundingClientRect().width),
  }))
  expect(back.collapsed, 'a second click brings it back').toBe(false)
  expect(Math.abs(back.weekW - before.weekW), 'the week returns to its docked width').toBeLessThanOrEqual(2)

  /* MID-SCROLL, THE SLIDE STAYS WHERE THE EYE IS. The resting column is
     position:sticky, so once the page is scrolled its pinned top is far from its
     static position — and the collapsed absolute rule alone would land it there,
     teleporting the panel up off-screen before the sideways slide (measured:
     top 8 → -888 at scrollY 1200 before the inline-top pin in interactions.ts). */
  await page.evaluate(() => window.scrollTo(0, 1200))
  await page.waitForTimeout(80)
  const pinned = await page.evaluate(() =>
    Math.round((document.querySelector('.edit-board .eroster') as HTMLElement).getBoundingClientRect().top))
  await page.click('.ros-rail')
  await page.waitForTimeout(30) // mid-slide — position already flipped to absolute
  const midSlide = await page.evaluate(() =>
    Math.round((document.querySelector('.edit-board .eroster') as HTMLElement).getBoundingClientRect().top))
  expect(Math.abs(midSlide - pinned), 'collapsing mid-scroll keeps the column at its pinned top — no vertical teleport').toBeLessThanOrEqual(2)
  await page.waitForTimeout(320)
  await page.click('.ros-rail') // restore for any test after us
  await page.waitForTimeout(350)
})

/* THE BOARD PEOPLE CELLS RESERVE A STEADY-HEIGHT TRAILING DROP ZONE (owner,
   26 Aug 26 — "can the screen be stable when I try to add in more pucks … the
   puck will not fill up the entire width … there's always an empty space to drop
   the pucks"). The zone is PERMANENT: its height never depends on drag state, so
   starting a drag reflows nothing — the earlier +ADD strip grew every people cell
   from zero at once and jumped the whole board out from under the finger. And a
   people row always keeps a bare patch to the RIGHT of its pucks (the zone grows
   into the row's leftover width, wrapping to its own line only once the pucks
   pack it), so a drop never lands on a seated puck and swaps it. jsdom has no
   layout, so only a browser can prove the heights. */
test('desktop: the board people cells keep a steady-height trailing drop zone', async ({ page }) => {
  await page.setViewportSize(DESK)
  await login(page)
  await go(page, 'editsched')
  await page.evaluate(() => (window as any).openScheduler(0))
  await page.waitForSelector('#sbBoard .ppl[data-fill]')
  const m = await page.evaluate(() => {
    const cells = [...document.querySelectorAll('#sbBoard .ppl[data-fill]')] as HTMLElement[]
    const heights = () => cells.map(c => Math.round(c.getBoundingClientRect().height))
    const rest = heights()
    document.body.classList.add('dnd'); const dnd = heights(); document.body.classList.remove('dnd')
    document.body.classList.add('arming'); const arming = heights(); document.body.classList.remove('arming')
    const changed = rest.filter((h, i) => h !== dnd[i] || h !== arming[i]).length
    // a filled flat (non-grid) people cell leaves a trailing gap: the pucks stop
    // short of the cell's right edge, and its .addz drop zone fills the rest
    const filled = cells.find(c => !c.classList.contains('fcprcp') && c.querySelector('.puck'))!
    const cr = filled.getBoundingClientRect()
    const pucks = [...filled.querySelectorAll('.puck')] as HTMLElement[]
    const lastRight = Math.max(...pucks.map(p => p.getBoundingClientRect().right))
    const addz = filled.querySelector(':scope > .addz') as HTMLElement
    return { cellCount: cells.length, changed, addzH: Math.round(addz.getBoundingClientRect().height),
      trailingGap: Math.round(cr.right - lastRight) }
  })
  expect(m.changed, 'no cell changes height when a drag or arm starts — the board never jumps').toBe(0)
  expect(m.addzH, 'the drop zone holds a steady, usable height at rest').toBeGreaterThan(0)
  expect(m.trailingGap, 'the pucks never fill the full width — a bare drop patch always remains').toBeGreaterThan(20)
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
       show to save — rest clears 10:45, step is 07:40 — so the
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
       really moved rather than the target happening to be above the fold.
       The scroller is `.sb-boardwrap` on desktop now (26 Aug 26 — the sign-off
       scrolls away WITH the board column, so #sbBoard itself is overflow:visible
       and the whole column scrolls); the pre-scroll and the in-view clip box both
       read that column, not #sbBoard. */
    await page.evaluate(() => { const b = document.querySelector('.sb-boardwrap') as HTMLElement; b.scrollTop = b.scrollHeight })
    await page.click('#sbWarn .wln[data-wdi]')
    await settleBoth(page, '.sb-boardwrap')

    const m = await page.evaluate(() => {
      const board = document.querySelector('.sb-boardwrap') as HTMLElement
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

  /* THE DISMISS HOLD (owner, 14 Aug 26 — "when I click on an empty space… my
     view snaps to some random area. hold my view steady"). Clicking a warning
     snaps the view DOWN to the guilty puck, which leaves the expanded box off
     the top of the screen. Tapping blank to dismiss it collapses the box, and
     because the day repaints by an outerHTML swap the browser's own scroll
     anchoring cannot survive the replaced node — so the height removed above
     the viewport used to fling the whole view up (measured −1103px on a phone,
     the puck clean off the top). holdViewStill undoes the shift in the same
     task as the swap. jsdom cannot see it: every rect is 0×0, so the delta is
     zero there by construction and the hold is only real in a browser. */
  test('a blank tap that dismisses a warning box holds the view where it snapped', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await login(page)
    await go(page, 'viewsched')

    const di = 0                       // day 0 carries hard warnings in the seed
    await page.click(`#vWeek .day[data-day="${di}"] .daywarn[data-daywarn]`)
    await page.waitForSelector(`#vWeek .day[data-day="${di}"] .dwlist .witem[data-wdi]`)
    /* click a warning: the view snaps down to the guilty puck, putting the box
       off the top of the screen — the exact setup the jump needed */
    await page.click(`#vWeek .day[data-day="${di}"] .dwlist .witem[data-wdi]`)
    await settleWeek(page, '#vWeek')

    const before = await page.evaluate((d) => {
      const puck = document.querySelector(`#vWeek .day[data-day="${d}"] .puck.wfoc:not(.echo)`) as HTMLElement
      if (!puck) return null
      const day = document.querySelector(`#vWeek .day[data-day="${d}"]`) as HTMLElement
      const id = puck.dataset.person!
      const ix = [...day.querySelectorAll(`.puck[data-person="${id}"]`)].indexOf(puck)
      return { id, ix, top: Math.round(puck.getBoundingClientRect().top) }
    }, di)
    expect(before, 'a warning focused a puck on screen').not.toBeNull()

    /* tap blank: dispatch on the day body itself (inside the page, on nothing
       interactive) so it takes the blank-clear path. clickHere, so Playwright
       does not scroll it into view first and hand the app a position it never
       reached — the very thing under test. */
    expect(await clickHere(page, `#vWeek .day[data-day="${di}"] .day-body`)).toBe(true)
    await settleWeek(page, '#vWeek')

    const after = await page.evaluate(([d, id, ix]) => {
      const boxOpen = !!document.querySelector(`#vWeek .day[data-day="${d}"] .witem[data-wdi]`)
      const puck = [...document.querySelectorAll(`#vWeek .day[data-day="${d}"] .puck[data-person="${id}"]`)][ix as number] as HTMLElement
      return { collapsed: !boxOpen, top: puck ? Math.round(puck.getBoundingClientRect().top) : null }
    }, [di, before!.id, before!.ix] as const)

    expect(after.collapsed, 'the blank tap dismissed the warning box').toBe(true)
    expect(after.top, 'the puck the reader was looking at is still on the page').not.toBeNull()
    expect(Math.abs(after.top! - before!.top), 'the view held steady — the puck did not leap').toBeLessThanOrEqual(2)
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
  /* nine DOM children since the FCP/RCP seats wrap in one .sb-seatpair (owner,
     14 Aug 26 — display:contents on desktop so the grid still counts the two
     seats; a 2-col grid on a phone so they sit side by side). Before that it
     was ten (the reorder grip from 8 Aug plus nine); the pair folds two of
     those ten into one child, leaving nine, with the grid still seeing ten. */
  expect(n, 'nine DOM children — the two seats share .sb-seatpair, .sb-rcell still exactly one').toBe(9)
})

test('board at 390px: the remarks cell rides beside the seat pucks, and its config button stays reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 })
  await login(page); await go(page, 'editsched')
  await page.click('.sb-open')
  /* the remarks cell used to drop to its own full-width strip below the
     pucks; it now sits to the RIGHT of the packed seat pair on the same row
     (owner, 16 Aug 26 — "the remarks row will go up to the right of the
     pucks"), so it takes the right portion of the line, not the whole width */
  const sp = await page.locator('#schedBoard .sb-line .sb-seatpair').first().boundingBox()
  const cell = await page.locator('#schedBoard .sb-line .sb-rcell').first().boundingBox()
  expect(cell!.x, 'the remarks cell starts to the right of the seat pair').toBeGreaterThan(sp!.x + sp!.width - 4)
  expect(Math.abs(cell!.y - sp!.y), 'and shares the pucks row, not a strip below').toBeLessThan(24)
  expect(cell!.width, 'still wide enough to read a mission remark').toBeGreaterThan(120)
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
   site, 8 Aug 26). Grid auto-flow is sequential: an earlier layout let the
   two 74px seats slide into the 46px time tracks — pucks painting over each
   other and over the "+ RCP" dashed box. The seats now pack side by side in
   their own two 74px tracks on the left, with the brief on row 1 and the
   remarks cell to their right (owner 16 Aug 26); this still asserts no puck
   overlaps a neighbour or a time box. Only a browser can see any of this —
   the class list never changed. */
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
      /* FCP and RCP share ONE row now, side by side (owner, 14 Aug 26 — save
         vertical space): same top, FCP left of RCP */
      if (slots.length === 2) {
        if (Math.abs(slots[0]!.top - slots[1]!.top) > 2) bad.push(`line ${li}: seats not on the same row`)
        if (slots[0]!.left >= slots[1]!.left) bad.push(`line ${li}: FCP is not left of RCP`)
      }
    })
    return bad
  })
  expect(geo, 'the two seats share a row side by side, clear of each other and every input').toEqual([])
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
    /* the Sunday dot used to be probed here; the phone dots left the bar on
       23 Aug 26, so the right-edge control on the day row is the next-day
       arrow now — same question (does the drawer's sliver steal the tap?) */
    return { close: at('#sbClose'), next: at('#sbNextDay'), rmk: at('#sbBoard .sb-line .nts') }
  })
  expect(hits.close, 'the Close button owns its own pixels').toBe('sbClose')
  expect(hits.next, 'the next-day arrow owns its pixels').toContain('sbNextDay')
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
  await page.locator('#schedBoard .sb-roster .rpuck', { hasText: 'Ledger' }).first().click()
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

/* THE BOARD PALETTE COLUMNS DO NOT OVERLAP (owner, 14 Aug 26 — "scheduler
   board mode the alignment overlaps each other. But edit schedule mode is
   ok"). The board drawer's columns are `flex:1`; with a third Personnel column
   the three squeezed below the fixed 74px puck width, so every puck (and its
   struck-name reason line) spilled 15px into the next column. The 24 Aug 26
   SANS/Personnel swap resolved that structurally: the seat grid is now just
   Pilots | WSOs, and Personnel (ground crew) drops to its own full-width band
   (.rpers) below, its pucks wrapping instead of sharing the narrow grid. So
   this pins TWO seat columns that never overlap, plus a Personnel band whose
   pucks stay on screen. Only a real browser can see it: jsdom measures 0×0. */
test('board at 390px: the armed aircrew columns never overlap their neighbour', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await login(page); await go(page, 'editsched')
  await page.click('.sb-open')
  /* arm a programme append cell — Monday's seed crews every flying seat, and a
     programme slot bars enough names that struck reason lines are drawn */
  await page.evaluate(() => (document.querySelector('#sbBoard [data-fill^="a:"]') as HTMLElement).click())
  await page.waitForTimeout(400)
  const r = await page.evaluate(() => {
    const ros = document.querySelector('#sbRoster')!
    const cols = [...ros.querySelectorAll('.rcol')].map(c => c.getBoundingClientRect())
    // every puck AND reason line must stay within its own column's right edge
    let spills = 0
    ros.querySelectorAll('.rcol').forEach(c => {
      const cr = c.getBoundingClientRect()
      c.querySelectorAll('.puck, .rwhy').forEach(el => { if (el.getBoundingClientRect().right > cr.right + 0.5) spills++ })
    })
    // and no two adjacent columns overlap, and the last stays on screen
    let colOverlap = 0
    for (let i = 1; i < cols.length; i++) if (cols[i].left < cols[i - 1].right - 0.5) colOverlap++
    // Personnel is a full-width band now (owner, 24 Aug 26), not a seat column;
    // its wrapping pucks must still stay within the 390px screen
    const pers = ros.querySelector('.rpers')
    let persOff = 0
    if (pers) pers.querySelectorAll('.puck').forEach(el => { if (el.getBoundingClientRect().right > 390.5) persOff++ })
    return { nCols: cols.length, spills, colOverlap,
             lastRight: cols.length ? Math.round(cols[cols.length - 1].right) : 0,
             haswhy: ros.querySelectorAll('.rpuck.no.haswhy').length,
             hasPersBand: !!pers, persOff }
  })
  expect(r.haswhy, 'the arm drew struck entries with reason lines').toBeGreaterThan(0)
  expect(r.nCols, 'Pilots and WSOs are the two seat columns now').toBe(2)
  expect(r.hasPersBand, 'Personnel drops to its own full-width band').toBe(true)
  expect(r.persOff, 'the Personnel band pucks stay on screen').toBe(0)
  expect(r.spills, 'no puck or reason line spills past its column').toBe(0)
  expect(r.colOverlap, 'no column overlaps its neighbour').toBe(0)
  expect(r.lastRight, 'the last column stays on screen').toBeLessThanOrEqual(390)
})

/* THE PHONE BOARD IS ONE WINDOW (owner, 8 Aug 26 — comp approved before
   build). It used to be three stacked zones: panels, then a bottom-pinned
   Live-checks + roster sheet, split by a resize grip. Now it matches the
   edit week: the warnings strip rides at the top of the one scroller, the
   roster parks in a right-edge AIRCREW drawer that slides over the board,
   and arming a slot pulls the drawer open by itself (the week's own
   gesture). All geometry — jsdom can pin the classes (odds.test.tsx) but
   not that anything actually sits, slides or stays on screen. */
test('the phone board is one window: sign-off, then checks, then panels, aircrew in an edge drawer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 })
  await login(page); await go(page, 'editsched')
  await page.click('.sb-open')
  /* the strip opens FOLDED since the same-day critique (its rows hide until
     the header is tapped — pinned both ways by the fold test), so the
     order contract is asserted on the header line */
  await expect(page.locator('#schedBoard .sb-warn .wh').first()).toBeVisible()
  /* sign-off first, the Live Checks bar directly below it, then the board
     panels (owner, 14 Aug 26 — "put it right below sign off section") */
  const sign = await page.locator('#sbSign').boundingBox()
  const warn = await page.locator('#schedBoard .sb-warn').boundingBox()
  const panel = await page.locator('#sbBoard .sb-panel').first().boundingBox()
  expect(warn!.y, 'the checks bar sits below the sign-off').toBeGreaterThan(sign!.y)
  expect(warn!.y, 'and above the first board panel').toBeLessThan(panel!.y)
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
   (scheduler.css's own comment: the seat pair, the remarks cell and the
   controls drop to their own full-width strips on purpose, because there is
   no room for all nine columns — the brief B now rides row 1 inline between
   MSN and TO, owner 16 Aug 26) — asserting it single-row would be asserting
   against a documented, reviewed design choice, not a bug. 390px .sb-wide is the one combination that
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
    /* nine, not ten, since the FCP/RCP seats now share one .sb-seatpair child
       (owner, 14 Aug 26) — display:contents on desktop keeps the grid at ten
       items, a 2-col grid on a phone sits the seats side by side */
    expect(m.children, `${c.label}: nine DOM children — seats share .sb-seatpair, .sb-rcell still exactly one`).toBe(9)
    if (c.singleRow) {
      expect(m.height, `${c.label}: single row, not exploded into three`).toBeLessThan(90)
    } else {
      /* the deliberate phone layout is still multi-row (CS/MSN/B/TO/LD on
         row 1, then seat pair, remarks, controls) — the brief folded back
         onto row 1 (owner, 16 Aug 26) and the seat pair sits on one row, but
         the line is not collapsed to a single row */
      expect(m.height, `${c.label}: the deliberate mobile stack, not collapsed to one row`).toBeGreaterThan(90)
    }
  }
})

/* THE BRIEF RIDES ROW 1 ON THE PHONE (owner, 16 Aug 26 — "arrange the board
   like the edit schedule: brief then TO then LD… put brief after msn and
   before TO. Now u will be able to shorten 1 row"). The brief cell used to drop
   to its own full-width strip below CS/MSN/TO/LD; it now sits inline as the
   third column, so the row reads CS | MSN | B | TO | LD like the week and the
   desktop board, and the flying line is one strip shorter. Pinned by geometry
   because jsdom cannot see which grid row a cell lands on. */
test('the board flying line carries the brief inline between MSN and TO at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await login(page); await go(page, 'editsched')
  await page.click('.sb-open')
  await page.waitForSelector('#schedBoard .sb-line')
  const m = await page.evaluate(() => {
    const head = document.querySelector('#schedBoard .sb-lcols') as HTMLElement
    const heads = [...head.children].filter(c => getComputedStyle(c).display !== 'none').map(c => c.textContent)
    const line = document.querySelector('#schedBoard .sb-line') as HTMLElement
    const cs = line.querySelector('.lin') as HTMLElement
    const bcell = line.querySelector('.sb-bcell') as HTMLElement
    const y = (el: HTMLElement) => Math.round(el.getBoundingClientRect().top)
    const cx = (el: HTMLElement) => Math.round(el.getBoundingClientRect().left)
    const msn = line.querySelector('.msn') as HTMLElement
    // the two visible time inputs after the brief input are TO then LD
    const times = [...line.querySelectorAll('.tm')] as HTMLElement[]
    const to = times[1], ld = times[2]   // times[0] is the brief's own .tm input
    return {
      heads,
      briefInlineWithCs: Math.abs(y(bcell) - y(cs)) < 12,
      order: cx(msn) < cx(bcell) && cx(bcell) < cx(to) && cx(to) < cx(ld),
    }
  })
  expect(m.heads, 'the header reads CS MSN B TO LD').toEqual(['CS', 'MSN', 'B', 'TO', 'LD'])
  expect(m.briefInlineWithCs, 'the brief cell shares row 1 with the callsign, not a strip below it').toBe(true)
  expect(m.order, 'columns run MSN → B → TO → LD left to right').toBe(true)
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
  /* FOUR since 20 Aug 26, and the change is deliberate: a 50px spacer track
     was inserted so the remarks box could start where the flying line's does
     (the owner's ringed screenshot — see the alignment test at the foot of
     this file). Row 1 is unmoved by it, because the name cell spans the first
     PAIR of tracks; that is what the item-width and label assertions below
     still pin, and they are the ones that actually catch a mis-indexed
     column. Common Programme keeps three. */
  expect(m.tracks).toBe(4)
  expect(m.hdrTracks).toBe(4)
  /* the 6 Aug regression: the ITEM column collapsed to a 14px stub */
  expect(m.item).toBeGreaterThan(150)
  /* the labels that survive the nth-child hide, in DOM order, must be
     exactly the ones the phone body columns still show — Role/Start/End
     for the duty panel, CS/MSN/B/TO/LD for the flying line (the brief B
     rides row 1 inline now, owner 16 Aug 26) — or a header is sitting over
     the wrong body column even though the cell COUNT still happens to match
     the track count. */
  expect(m.c6rLabels).toEqual(['Role', 'Start', 'End'])
  expect(m.flyLabels).toEqual(['CS', 'MSN', 'B', 'TO', 'LD'])
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

/* ---- the 22 Aug 26 chrome batch — five geometry/paint contracts jsdom
   cannot see (0x0 rects, no stylesheet), pinned here in the real browser ---- */

test('the desktop day sign-off is ONE row of four equal pills', async ({ page }) => {
  await page.setViewportSize(DESK)
  await login(page); await go(page, 'editsched')
  const m = await page.evaluate(() => {
    const so = document.querySelector('#page-editsched .signoff.day-sign')!
    const pills = [...so.querySelectorAll('.sgn')].map(p => {
      const r = p.getBoundingClientRect(); return { w: Math.round(r.width), top: Math.round(r.top) }
    })
    return { rows: new Set(pills.map(p => p.top)).size, widths: pills.map(p => p.w) }
  })
  expect(m.widths.length, 'four pills').toBe(4)
  expect(m.rows, 'all four on one row').toBe(1)
  /* equal shares of the row — flex 1 1 0, not luck: the widest and narrowest
     stay within a border's worth of each other */
  expect(Math.max(...m.widths) - Math.min(...m.widths)).toBeLessThanOrEqual(8)
})

test('the board title is a fixed slot, so the day chips do not shift between days', async ({ page }) => {
  await page.setViewportSize(DESK)
  await login(page); await go(page, 'editsched')
  await page.evaluate(() => (window as any).openScheduler(2)) // Wednesday, the widest name
  await page.waitForSelector('.schedboard .sb-days')
  const read = () => page.evaluate(() => ({
    title: Math.round(document.querySelector('.schedboard .sb-title')!.getBoundingClientRect().width),
    daysLeft: Math.round(document.querySelector('.schedboard .sb-days')!.getBoundingClientRect().left),
  }))
  const wed = await read()
  await page.evaluate(() => (window as any).openScheduler(4)) // Friday, the narrowest
  await page.waitForTimeout(150)
  const fri = await read()
  expect(wed.title, 'the slot holds its width').toBe(fri.title)
  expect(wed.daysLeft, 'the chips stay put').toBe(fri.daysLeft)
})

test('Ground and Common Programme share the sims columns on desktop', async ({ page }) => {
  await page.setViewportSize(DESK)
  await login(page); await go(page, 'editsched')
  const m = await page.evaluate(() => {
    const day = document.querySelector('#page-editsched .day')!
    const ppl = (sel: string) => {
      const row = day.querySelector(sel); const p = row?.querySelector('.ppl')
      return p ? { left: Math.round(p.getBoundingClientRect().left), w: Math.round(p.getBoundingClientRect().width) } : null
    }
    return { sim: ppl('.sec-sim .pl-row'), grnd: ppl('.sec-grnd .pl-row'), common: ppl('.allhands .ah-row') }
  })
  expect(m.sim && m.grnd && m.common, 'all three rows render').toBeTruthy()
  expect(m.grnd!.left, 'ground People starts where sims does').toBe(m.sim!.left)
  expect(m.common!.left, 'common People starts where sims does').toBe(m.sim!.left)
  /* two pucks side by side: the column holds at least 2×74px + the gap */
  expect(m.grnd!.w).toBeGreaterThanOrEqual(152)
  expect(m.common!.w).toBeGreaterThanOrEqual(152)
})

test('the top bar wears the edit tint on Edit Schedule only', async ({ page }) => {
  await page.setViewportSize(DESK)
  await login(page)
  const bg = () => page.evaluate(() => getComputedStyle(document.querySelector('.topbar')!).backgroundImage)
  const view = await bg()
  await go(page, 'editsched')
  const edit = await bg()
  expect(edit, 'the two modes paint differently').not.toBe(view)
  await go(page, 'viewsched')
  expect(await bg(), 'and View-only keeps the neutral bar').toBe(view)
})

test('the Leave War desktop grid grows a fixed bottom scrollbar that drives it', async ({ page }) => {
  await page.setViewportSize(DESK)
  await login(page); await go(page, 'leavewar')
  await page.waitForSelector('.mx-wrap')
  /* scroll the PAGE down so the grid's own scrollbar is below the fold */
  await page.evaluate(() => window.scrollBy(0, 400))
  await page.waitForTimeout(200)
  const m = await page.evaluate(() => {
    const el = document.querySelector('.mx-hbar')
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { bottom: Math.round(r.bottom), vh: window.innerHeight }
  })
  expect(m, 'the proxy scrollbar appears').toBeTruthy()
  expect(m!.bottom, 'pinned to the foot of the screen').toBe(m!.vh)
  /* it DRIVES the grid, and following the grid never loops */
  const sync = await page.evaluate(() => {
    const h = document.querySelector('.mx-hbar')!, w = document.querySelector('.mx-wrap')!
    h.scrollLeft = 500
    h.dispatchEvent(new Event('scroll'))
    return { h: h.scrollLeft, w: w.scrollLeft }
  })
  expect(sync.w, 'the grid follows the proxy').toBe(sync.h)
  /* and it never leaks onto the Raptor pages */
  await go(page, 'viewsched')
  expect(await page.$('.mx-hbar'), 'gone off the Leave War page').toBeFalsy()
})

/* TOMBSTONE (22 Aug 26): "a long unbreakable remark stays one clipped line"
   gated the board's read-only "Inputs · day" summary band's `.sbi-rm` cell —
   nowrap + ellipsis + tooltip, and the dead `.sbi-rmk` wrap-rule story
   (9 Aug 26). The band itself was removed from the board at the owner's ask
   ("remove this inputs bar"), so the cell renders nowhere and the contract
   has no surface; `sbInputsHTML` survives only as a probe-bridge builder.
   The board's LIVE input rows wrap by design (the 20 Aug textarea work,
   gated by their own tests below). */

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
      /* Personal Inputs folds to a summary by default now (Aug 26) — click the
         header to expand it before measuring its rows. */
      await page.waitForSelector('#schedBoard .pinp [data-pitog]')
      await page.click('#schedBoard .pinp [data-pitog]')
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
      /* Personal Inputs folds by default now (Aug 26) — expand it to line its
         rows up against the ground programme's. */
      await page.waitForSelector('#schedBoard .pinp [data-pitog]')
      await page.click('#schedBoard .pinp [data-pitog]')
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

  /* REWRITTEN 23 Aug 26 (owner): this test used to pin the day chips as DOTS
     and a tap-to-jump; the dots are gone from the phone bar now — the day row
     carries search + highlight between the arrows, and the arrows are the
     step control. The seven [data-sbtab] elements are still in the markup
     (dayTabsHTML is untouched — only CSS hides them), so what a browser must
     prove is that they paint NOTHING at phone width and that the arrows still
     do the whole job. */
  test('phone: the day strip is gone from the bar, and the arrows still step the day', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await login(page)
    await go(page, 'editsched')
    await page.evaluate(() => (window as any).openScheduler(0))
    await page.waitForSelector('#sbDays [data-sbtab]', { state: 'attached' })
    const m = await page.evaluate(() => {
      const strip = document.querySelector('#sbDays') as HTMLElement
      const r = strip.getBoundingClientRect()
      return {
        w: Math.round(r.width), h: Math.round(r.height),
        display: getComputedStyle(strip).display,
        tabs: strip.querySelectorAll('[data-sbtab]').length,
      }
    })
    expect(m.tabs, 'the seven elements are still in the markup — CSS hides, nothing else').toBe(7)
    expect(m.display, 'and the strip is display:none').toBe('none')
    expect(m.w, 'so it paints nothing').toBe(0)
    expect(m.h).toBe(0)
    /* the arrows still carry the day */
    await page.click('#sbNextDay')
    await page.waitForTimeout(150)
    expect(await page.evaluate(() => (window as any).SBDAY)).toBe(1)
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
        left: Math.round(r.left), right: Math.round(r.right),
        width: Math.round(r.width), vw: window.innerWidth,
        scrollable: body.scrollHeight > body.clientHeight,
        canScroll: getComputedStyle(body).overflowY,
      }
    })
    expect(m.drawerTop, 'the drawer clears the bar instead of painting over it')
      .toBeGreaterThanOrEqual(m.barBottom - 1)
    /* It sizes to the columns it holds (`width:max-content`) and is capped at
       78vw — the seed has ground crew, so three 74px columns plus the tab
       need ~76% here. A squadron with no Personnel column falls back to the
       thin two-column drawer. Both stay within the cap and on screen. */
    expect(m.width / m.vw, 'the drawer is no wider than its 78vw cap')
      .toBeLessThanOrEqual(0.78)
    expect(m.right, 'and its whole width is on screen').toBeLessThanOrEqual(m.vw + 1)
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

  /* PLACE() CLAMPS BOTH ENDS OF THE SCROLL, NOT JUST ONE. The re-anchor path
     (`bail` in histbubble.ts) re-runs on every scroll the phone's single
     scroller fires, and the old formula only ever clamped the BOTTOM of the
     screen — an anchor scrolled above the top had nothing stopping `top`
     from going negative. jsdom cannot scroll at all, so this is the only
     place the fault, or the fix, is reachable. */
  test('phone: an anchor at the top edge cannot push the bubble off-screen', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await login(page)
    await go(page, 'editsched')
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

    /* PINNED, not hovered — a phone re-anchor only ever runs behind a pinned
       bubble, since there is no pointer to leave in the first place. Pinning
       through the changes list (the same `jumpToChange` path a real user
       takes) is simpler than forcing four edits and a chevron tap just to
       reach the pinned state this test actually needs. */
    await page.click('#sbWarn .histln')
    await page.waitForSelector('#histBody')
    await page.click(`#histBody .hl-row.hit[data-hkey="${key}"]`)
    await page.waitForTimeout(400)     // the jump's own smooth scroll settles
    await expect(page.locator('.histbub')).toBeVisible()

    const scrollCellTo = (top: number) => page.evaluate(({ key, top }) => {
      const main = document.querySelector('.sb-main') as HTMLElement
      const cell = document.querySelector(`#sbBoard [data-slot="${key}"]`) as HTMLElement
      main.scrollTop += cell.getBoundingClientRect().top - top
    }, { key, top })
    const geom = () => page.evaluate(k => {
      const b = document.querySelector('.histbub') as HTMLElement
      const c = document.querySelector(`#sbBoard [data-slot="${k}"]`) as HTMLElement
      const r = b.getBoundingClientRect(), cr = c.getBoundingClientRect()
      return {
        l: Math.round(r.left), t: Math.round(r.top), rr: Math.round(r.right), bb: Math.round(r.bottom),
        vw: window.innerWidth, vh: window.innerHeight,
        vis: getComputedStyle(b).visibility,
        cellTop: Math.round(cr.top), cellBottom: Math.round(cr.bottom),
      }
    }, key)

    /* the anchor straddling the top edge — a few px of it still on screen */
    await scrollCellTo(-8)
    await page.waitForTimeout(150)
    let m = await geom()
    expect(m.cellTop, 'the cell really is straddling the top').toBeLessThan(0)
    expect(m.cellBottom, 'and still partly on screen').toBeGreaterThan(0)
    expect(m.t, 'the bubble stays on screen, not pushed above it').toBeGreaterThanOrEqual(0)
    expect(m.l, 'left edge too').toBeGreaterThanOrEqual(0)
    expect(m.rr, 'and the right').toBeLessThanOrEqual(m.vw)
    expect(m.bb, 'and the bottom').toBeLessThanOrEqual(m.vh)

    /* scrolled further — the anchor is now entirely above the viewport, so
       there is nothing true left for the bubble to point at */
    await scrollCellTo(-300)
    await page.waitForTimeout(150)
    m = await geom()
    expect(m.cellBottom, 'the cell is fully off the top now').toBeLessThan(0)
    expect(m.vis, 'so the bubble hides itself — it is not torn down').toBe('hidden')

    /* scrolled back — it returns on its own, with no new gesture */
    await scrollCellTo(60)
    await page.waitForTimeout(150)
    m = await geom()
    expect(m.cellTop, 'the cell is on screen again').toBeGreaterThanOrEqual(0)
    expect(m.vis, 'and the bubble is visible again').toBe('visible')
  })

  /* COLLAPSED = LAST THREE ON A PHONE, WHOLE STORY ON DESKTOP HOVER. jsdom
     proves which element and how many `li` (histbubble.test.tsx), not that a
     hovering pointer at 1440px actually sees four of them with no chevron —
     that is a real hover event and a real DOM read, both of which need a
     browser. */
  test('desktop: shows the whole story on hover, with no chevron', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await login(page)
    await go(page, 'editsched')
    await page.evaluate(() => (window as any).openScheduler(0))
    await page.waitForSelector('#sbHist')

    const key = await page.evaluate(() => {
      const w = window as any
      const el = [...document.querySelectorAll('#sbBoard [data-slot]')]
        .find(e => /\.[pw]$/.test((e as HTMLElement).dataset.slot || ''))
      const k = (el as HTMLElement).dataset.slot
      const names = ['bane', 'stiff', 'slipway', 'dj', 'nact']
      let i = 0
      for (let c = 0; c < 4; c++) {
        let v = names[i % names.length]
        while (v === w.slotVal(k)) { i++; v = names[i % names.length] }
        w.setSlotVal(k, v); i++
      }
      return k
    })
    await page.click('#sbHist')
    await page.waitForTimeout(250)
    await page.locator(`#sbBoard [data-slot="${key}"]`).first().hover()
    await page.waitForTimeout(250)

    const m = await page.evaluate(() => {
      const b = document.querySelector('.histbub') as HTMLElement
      return { lis: b ? b.querySelectorAll('.hb-all li').length : -1, more: !!b?.querySelector('[data-histmore]') }
    })
    expect(m.lis, 'four edits, all of them — a hovering pointer already has the whole story').toBe(4)
    expect(m.more, 'no chevron on a desktop').toBe(false)
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
        const t = document.querySelector('#sbSign .histln-top') as HTMLElement
        const sign = document.querySelector('#sbSignBar') as HTMLElement
        return {
          top: vis('#sbSign .histln-top'), panel: vis('#sbWarn .histln'),
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

/* THE HIGHLIGHT CHIPS FOLD ON A PHONE (owner, 23 Aug 26) — the same
   CSS-picks-by-width shape as the changes list above. The strip became a
   CAT/Type/Quals ACCORDION on 24 Aug 26: under 820px the whole group of tabs
   has no size until the .hl-tog highlighter toggle unfolds it, and a chip then
   stays folded behind its own tab until that tab is expanded; on a desktop the
   tabs simply stand there with no tap. jsdom pins the state machine
   (hlfold.test.tsx); only a browser can say whether a folded control really
   paints nothing. */
test('the Highlight chips fold behind the toggle on a phone, and stand open on a desktop', async ({ page }) => {
  const size = (sel: string) => page.evaluate((s) => {
    const el = document.querySelector(s) as HTMLElement
    const r = el.getBoundingClientRect()
    return { w: Math.round(r.width), h: Math.round(r.height) }
  }, sel)
  const TAB = '#page-viewsched .filters .hl-gtab'
  const CHIP = '#page-viewsched .filters .fchip[data-hl]'
  await page.setViewportSize(PHONE)
  await login(page)
  const folded = await size(TAB)
  expect(folded.w, 'folded: the tabs paint nothing').toBe(0)
  expect(folded.h).toBe(0)
  await page.click('#page-viewsched .filters .hl-tog')
  await page.waitForTimeout(200)
  const openTab = await size(TAB)
  expect(openTab.w, 'one tap on the highlighter unfolds the tabs').toBeGreaterThan(0)
  expect(openTab.h).toBeGreaterThan(0)
  /* a chip is still folded behind its own tab until that tab is expanded */
  expect((await size(CHIP)).w, 'the chips wait behind their tab').toBe(0)
  await page.click(TAB)                    // expand the first group
  await page.waitForTimeout(200)
  expect((await size(CHIP)).w, 'expanding a tab paints its chips').toBeGreaterThan(0)
  /* desktop: no toggle needed — the tabs stand open with no tap, because the
     fold rules live inside the 820px block and desktop never gates on them */
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.waitForTimeout(200)
  expect((await size(TAB)).w, 'a desktop shows the tabs with no tap').toBeGreaterThan(0)
})

/* THE EXPANDED CHIP ROW SCROLLS SIDEWAYS, IT DOES NOT STRETCH THE PAGE
   (owner, 26 Aug 26 — "Quals is extended too much … follow how the scheduler
   board highlighter is designed where I can scroll left and right"). Quals is
   the widest group (six chips) and is one atomic inline-flex unit that cannot
   wrap; expanded on a phone it must overflow WITHIN its own row — the same
   nowrap + overflow-x:auto recipe as the board's .sb-hl.open — and never widen
   the document. Only a browser can measure real overflow, so it is pinned here. */
test('the expanded highlight chips scroll sideways, not off the page', async ({ page }) => {
  await page.setViewportSize(PHONE)
  await login(page)
  await page.click('#page-viewsched .filters .hl-tog')          // unfold the chips
  await page.waitForTimeout(150)
  await page.locator('#page-viewsched .filters .hl-gtab', { hasText: 'Quals' }).click()
  await page.waitForTimeout(200)
  const m = await page.evaluate(() => {
    const row = document.querySelector('#page-viewsched .filters.hl-open .hlrow') as HTMLElement
    return {
      overflowX: getComputedStyle(row).overflowX,
      rowScrollable: row.scrollWidth > row.clientWidth + 2,
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }
  })
  expect(m.overflowX, 'the chip row is its own sideways scroller').toBe('auto')
  expect(m.rowScrollable, 'the six Quals chips overflow within the row').toBe(true)
  expect(m.pageOverflow, 'the page itself never scrolls sideways').toBeLessThanOrEqual(1)
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
      const hl = document.querySelector('#sbHl') as HTMLElement
      const search = document.querySelector('.sb-nav .sb-search') as HTMLElement
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
        /* the day strip left this row on 23 Aug 26 — search + highlight
           took its place between the two arrows */
        dotsW: Math.round(r(dots).width),
        middleBetween: Math.round(r(hl).left) >= Math.round(r(prev).right)
          && Math.round(r(search).left) >= Math.round(r(hl).right)
          && Math.round(r(search).right) <= Math.round(r(next).left),
        overflow: top.scrollWidth - top.clientWidth,
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }
    })
    expect(m.prevLeft, 'the previous arrow is against the left edge').toBeLessThanOrEqual(10)
    expect(m.nextRight, 'and the next one against the right').toBeLessThanOrEqual(10)
    expect(m.sameLine, 'both on the same line').toBe(true)
    expect(m.arrowsBelowActions, 'on the day row, below the title and the buttons').toBe(true)
    expect(m.dotsW, 'the dots are gone from the row').toBe(0)
    expect(m.middleBetween, 'with the highlight toggle then the search between the arrows').toBe(true)
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

  test('phone: tapping them steps the day and flows continuously across weeks', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await login(page)
    await go(page, 'editsched')
    await page.evaluate(() => (window as any).openScheduler(0))
    await page.waitForSelector('#sbPrevDay')
    /* CONTINUOUS ACROSS WEEKS (owner, 22 Aug 26): no longer disabled at the ends */
    expect(await page.locator('#sbPrevDay').isDisabled(), 'Monday still steps back — into last week').toBe(false)
    for (let i = 1; i <= 6; i++) {
      await page.click('#sbNextDay')
      await page.waitForTimeout(120)
      expect(await page.evaluate(() => (window as any).SBDAY)).toBe(i)
    }
    /* one more next off Sunday loads the following week and lands on its Monday */
    const wk0 = await page.evaluate(() => (window as any).CURWEEK)
    expect(await page.locator('#sbNextDay').isDisabled(), 'Sunday still steps forward — into next week').toBe(false)
    await page.click('#sbNextDay')
    await page.waitForTimeout(150)
    expect(await page.evaluate(() => (window as any).SBDAY)).toBe(0)
    expect(await page.evaluate(() => (window as any).CURWEEK), 'the next week is loaded').not.toBe(wk0)
    /* the day really is redrawn on the new week: every board address starts with
       the day index, and it is day 0 */
    expect(await page.evaluate(() =>
      document.querySelector('#sbBoard [data-slot]')!.getAttribute('data-slot')!.replace(/^[a-z]+:/, '').split('.')[0])).toBe('0')
    /* and stepping back off Monday returns to the previous week's Sunday */
    await page.click('#sbPrevDay')
    await page.waitForTimeout(150)
    expect(await page.evaluate(() => (window as any).SBDAY)).toBe(6)
    expect(await page.evaluate(() => (window as any).CURWEEK), 'back on the week we came from').toBe(wk0)
  })

  test('desktop: the board has visible week arrows that jump a week and keep the day', async ({ page }) => {
    await page.setViewportSize(DESK)
    await login(page)
    await go(page, 'editsched')
    await page.evaluate(() => (window as any).openScheduler(3))   // Thursday
    await page.waitForSelector('#sbDays [data-sbweek]')
    // two week arrows, and they are actually laid out (not display:none like on a phone)
    const vis = await page.evaluate(() => {
      const a = [...document.querySelectorAll('#sbDays [data-sbweek]')] as HTMLElement[]
      return { n: a.length, widths: a.map(x => Math.round(x.getBoundingClientRect().width)) }
    })
    expect(vis.n, 'two week arrows flank the day chips').toBe(2)
    expect(vis.widths.every(w => w > 0), 'both arrows are visible on desktop').toBe(true)
    // clicking › jumps a whole week and keeps Thursday selected
    const wk0 = await page.evaluate(() => (window as any).CURWEEK)
    await page.click('#sbDays [data-sbweek="1"]')
    await page.waitForTimeout(150)
    expect(await page.evaluate(() => (window as any).CURWEEK), 'the next week loaded').not.toBe(wk0)
    expect(await page.evaluate(() => (window as any).SBDAY), 'Thursday stays open').toBe(3)
    // and ‹ returns to the week we came from, still on Thursday
    await page.click('#sbDays [data-sbweek="-1"]')
    await page.waitForTimeout(150)
    expect(await page.evaluate(() => (window as any).CURWEEK), 'back to the original week').toBe(wk0)
    expect(await page.evaluate(() => (window as any).SBDAY), 'still Thursday').toBe(3)
  })

  test('phone: the top-left calendar icon opens the week picker', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await login(page)
    await go(page, 'editsched')
    await page.evaluate(() => (window as any).openScheduler(2))
    await page.waitForSelector('#sbCal')
    /* it sits on the bar's first line, left of the day title */
    const order = await page.evaluate(() => {
      const cal = document.querySelector('#sbCal') as HTMLElement
      const title = document.querySelector('.sb-title') as HTMLElement
      return { calLeft: Math.round(cal.getBoundingClientRect().left), titleLeft: Math.round(title.getBoundingClientRect().left) }
    })
    expect(order.calLeft, 'the calendar icon is left of the day title').toBeLessThan(order.titleLeft)
    await page.click('#sbCal')
    await page.waitForSelector('#weekCal .rc-grid')
    expect(await page.locator('#weekCal').isVisible()).toBe(true)
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

/* ===================================================================
   THE VIEWPORT META STAYS BARE OFF-APPLE (12 Aug 26). index.html carries an
   inline script that appends `maximum-scale=1` ON APPLE TOUCH DEVICES ONLY —
   iOS honours it for the focus auto-zoom (the thing the owner asked to stop)
   while ignoring it for pinch zoom, but Android Chrome would lose pinch zoom
   outright. iOS itself is not reachable from this container, so what CAN be
   gated is the other half of the contract: in Chromium the script must not
   fire, or Android users pay for an iOS fix.
   =================================================================== */
test.describe('the viewport meta', () => {
  test('is untouched where the platform is not an Apple touch device', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await page.goto('/')
    const content = await page.evaluate(() =>
      (document.querySelector('meta[name=viewport]') as HTMLMetaElement).getAttribute('content'))
    expect(content, 'no maximum-scale leaks onto non-iOS platforms').not.toContain('maximum-scale')
    expect(content).toContain('width=device-width')
  })
})

/* The green eligibility rings (owner approved the comp, 13 Aug 26): with a
   person selected, an empty slot he could take rings bright green with a
   glow, a filled one he could take dims with a tint, and neither is
   confusable with the armed dashed ring. jsdom already pins WHICH classes
   are hung and that they agree with slotBar (selrings.test.tsx); only a real
   browser can prove the paints differ and that a ring moves no layout. */
test.describe('the green eligibility rings', () => {
  test('empty vs filled vs armed are distinct paints, and rings move nothing', async ({ page }) => {
    await page.setViewportSize(DESK)
    await login(page)
    await go(page, 'editsched')

    /* empty one rear seat through the funnel, then pick the selection FROM THE
       ORACLE: a real WSO slotBar clears for the emptied seat AND for some
       still-filled seat held by someone else — so an empty ring and a filled
       ring both exist by construction, whatever the seed's tasking looks like */
    const pick = await page.evaluate(() => {
      const w = window as any
      const seat = [...document.querySelectorAll('#eWeek .seat[data-slot$=".w"]')]
        .find(s => s.querySelector('.puck[data-person]')) as HTMLElement | undefined
      if (!seat) return null
      const k = seat.dataset.slot!
      w.setSlotVal(k, ''); w.afterSchedMutate()
      const seats = [...document.querySelectorAll('#eWeek .seat[data-slot]')] as HTMLElement[]
      for (const id of Object.keys(w.PEOPLE)) {
        const p = w.PEOPLE[id]
        if (p.special || p.pers || p.archived || p.seat !== 'RCP') continue
        if (w.slotBar(id, k)) continue
        const filled = seats.some(s => {
          const sk = s.dataset.slot!
          const occ = (() => { try { return w.slotVal(sk) } catch { return '' } })()
          return occ && occ !== id && !w.slotBar(id, sk)
        })
        if (filled) return { k, id }
      }
      return null
    })
    test.skip(!pick, 'no WSO clears both an empty and a filled seat in the seed')
    const key = pick!.k
    await page.waitForTimeout(300)

    /* the seat's box before any ring is up */
    const before = await page.evaluate((k) => {
      const b = (document.querySelector(`#eWeek [data-slot="${k}"]`) as HTMLElement).getBoundingClientRect()
      return { w: +b.width.toFixed(1), h: +b.height.toFixed(1) }
    }, key)

    await page.evaluate((id) => (window as any).selectPerson(id), pick!.id)
    await page.waitForTimeout(300)

    const r = await page.evaluate((k) => {
      const read = (el: HTMLElement | null) => {
        if (!el) return null
        const cs = getComputedStyle(el), b = el.getBoundingClientRect()
        return { style: cs.outlineStyle, color: cs.outlineColor, shadow: cs.boxShadow,
          bg: cs.backgroundColor, w: +b.width.toFixed(1), h: +b.height.toFixed(1) }
      }
      return {
        empty: read(document.querySelector(`#eWeek [data-slot="${k}"].oktake`) as HTMLElement),
        filled: read(document.querySelector('#eWeek .seat.oktake-f') as HTMLElement),
      }
    }, key)

    expect(r.empty, 'the emptied rear seat rings as an empty spot').not.toBeNull()
    expect(r.filled, 'some filled seat rings as takeable').not.toBeNull()
    /* both greens are SOLID — dashed stays the armed ring's identity */
    expect(r.empty!.style).toBe('solid')
    expect(r.filled!.style).toBe('solid')
    /* bright + glow vs dimmed + tint: the empty ring glows (a box-shadow),
       the filled one does not and carries the tint instead */
    expect(r.empty!.shadow, 'the empty ring glows').toContain('px')
    expect(r.filled!.shadow, 'the filled ring does not glow').toBe('none')
    expect(r.filled!.bg, 'the filled slot carries the green tint').toContain('rgba(87, 201, 122')
    /* and the ringed seat still measures exactly what it did bare */
    expect({ w: r.empty!.w, h: r.empty!.h }, 'the ring moved nothing').toEqual(before)

    /* arm the same emptied seat: the armed ring must win and stay dashed */
    await clickHere(page, `#eWeek [data-slot="${key}"]`)
    await page.waitForTimeout(200)
    const armed = await page.evaluate((k) => {
      const el = document.querySelector(`#eWeek [data-slot="${k}"]`) as HTMLElement
      const cs = getComputedStyle(el)
      return { style: cs.outlineStyle, ok: el.classList.contains('oktake') }
    }, key)
    expect(armed.style, 'the armed ring stays dashed').toBe('dashed')
    expect(armed.ok, 'and the green ring stands down for it').toBe(false)
  })
})

/* The Available-crew panel is OPEN by default now (owner, Aug 26 — "all
   available crew section will open by default in edit schedule"); the header line
   is the whole control and folds it to one line. */
test.describe('the Available-crew panel folds', () => {
  test('open by default, folds on tap, opens back', async ({ page }) => {
    await page.setViewportSize(DESK)
    await login(page)
    await go(page, 'editsched')
    const open = await page.evaluate(() => {
      const p = document.querySelector('#eWeek .day[data-day="0"] .availpuck') as HTMLElement
      return p ? { h: p.getBoundingClientRect().height, grids: p.querySelectorAll('.ap-grid').length } : null
    })
    expect(open, 'the panel renders').not.toBeNull()
    expect(open!.grids, 'open by default, the grids are up').toBeGreaterThan(0)
    await clickHere(page, '#eWeek .day[data-day="0"] .ap-h[data-avtog]')
    await page.waitForTimeout(300)
    const closed = await page.evaluate(() => {
      const p = document.querySelector('#eWeek .day[data-day="0"] .availpuck') as HTMLElement
      return { h: p.getBoundingClientRect().height, grids: p.querySelectorAll('.ap-grid').length }
    })
    expect(closed.grids, 'folded, no puck grid').toBe(0)
    expect(closed.h, 'folded it really is one line').toBeLessThan(40)
    expect(open!.h, 'and open really is taller').toBeGreaterThan(closed.h * 2)
    await clickHere(page, '#eWeek .day[data-day="0"] .ap-h[data-avtog]')
    await page.waitForTimeout(200)
    const again = await page.evaluate(() =>
      (document.querySelector('#eWeek .day[data-day="0"] .availpuck') as HTMLElement).querySelectorAll('.ap-grid').length)
    expect(again, 'open again').toBeGreaterThan(0)
  })
})

/* ===================================================================
   THE CREW-DAY PICKER (owner, 15 Aug 26). The aircrew panel follows the
   left-most day in view, but on a wide screen the last days of the week can
   never reach the left edge (Sunday is the final day and clamps the scroll), so
   their crew was unreachable by scrolling. The day NAME is a picker now, the
   panel carries ‹ › arrows, and an edge hint teaches the gesture. jsdom cannot
   see any of it — every rect is 0×0 and there is no real scroll clamp — so the
   reachability and the hint are gated here, in a real browser at a wide width.
   =================================================================== */
test.describe('the crew-day picker', () => {
  const WIDE = { width: 1900, height: 900 }

  test('desktop: the last day is unreachable by scroll but reachable by its name', async ({ page }) => {
    await page.setViewportSize(WIDE)
    await login(page)
    await go(page, 'editsched')
    await page.waitForSelector('#eRoster .er-h .er-daynav')

    // the panel header carries exactly two stepper arrows
    const navs = await page.$$('#eRoster .er-h .er-daynav')
    expect(navs.length).toBe(2)

    // scroll the week hard against its right end, let the follow settle
    const atMax = await page.evaluate(() => {
      const w = document.getElementById('eWeek')!
      w.scrollLeft = w.scrollWidth
      return { last: w.querySelectorAll('.day[data-day]').length - 1 }
    })
    await page.waitForTimeout(300)
    // the panel is NOT on the last day — that is the bug this feature fixes
    const leftOfMax = await page.evaluate(() => {
      const w = document.getElementById('eWeek')!, wr = w.getBoundingClientRect()
      const days = [...w.querySelectorAll('.day[data-day]')] as HTMLElement[]
      const hit = days.find(d => d.getBoundingClientRect().right > wr.left + 8) || days[0]
      return +hit.dataset.day!
    })
    expect(leftOfMax).toBeLessThan(atMax.last)   // the last day can't be scrolled to the edge

    // clicking the LAST day's name loads it into the panel anyway
    const lastDow = await page.evaluate((d) =>
      document.querySelector(`#eWeek .day[data-day="${d}"] .dow`)!.textContent, atMax.last)
    await clickHere(page, `#eWeek .day[data-day="${atMax.last}"] .dow[data-crewday]`)
    await page.waitForTimeout(250)
    const head = await page.evaluate(() => document.querySelector('#eRoster .er-h')!.textContent)
    expect(head).toContain(lastDow!)
  })

  test('desktop: the week ends whole — Sunday can sit at the front, and the retired edge hint never shows', async ({ page }) => {
    await page.setViewportSize(WIDE)
    await login(page)
    await go(page, 'editsched')
    await page.waitForSelector('#eWeek .day[data-day]')
    // jam fully right: with the next-week preview and the re-measured tail the
    // far end is still a WHOLE column (live or preview), never a sliver …
    await page.evaluate(() => {
      const w = document.getElementById('eWeek')!
      w.style.scrollBehavior = 'auto'; w.scrollLeft = w.scrollWidth
      w.dispatchEvent(new Event('scroll', { bubbles: true }))
    })
    await page.waitForTimeout(300)
    const end = await page.evaluate(() => {
      const w = document.getElementById('eWeek')!, wl = w.getBoundingClientRect().left
      let bd = Infinity
      for (const d of w.querySelectorAll('.day')) { const g = Math.abs(d.getBoundingClientRect().left - wl); if (g < bd) bd = g }
      return Math.round(bd)
    })
    expect(end, 'the jammed end fronts a whole column, live or preview').toBeLessThan(40)
    // … and the old edge hint is retired: the preview removed the very
    // limitation it taught around (Sunday could never sit at the front), so
    // prove the limitation is gone rather than the apology present.
    expect(await page.evaluate(() => !!document.getElementById('crewHint'))).toBe(false)
    const sunFront = await page.evaluate(() => {
      const w = document.getElementById('eWeek')!
      const sun = w.querySelector('.day[data-day="6"]') as HTMLElement
      w.style.scrollBehavior = 'auto'
      w.scrollLeft += sun.getBoundingClientRect().left - w.getBoundingClientRect().left
      return new Promise<number>(res => setTimeout(() => {
        res(Math.round(Math.abs(sun.getBoundingClientRect().left - w.getBoundingClientRect().left)))
      }, 200))
    })
    expect(sunFront, 'the last live day can now sit at the front').toBeLessThan(40)
  })

  test('desktop: the panel arrows clamp at the weeks ends', async ({ page }) => {
    await page.setViewportSize(WIDE)
    await login(page)
    await go(page, 'editsched')
    await page.waitForSelector('#eRoster .er-h .er-daynav')
    // walk to Monday: the previous arrow goes dead, the next is live
    await clickHere(page, '#eWeek .day[data-day="0"] .dow[data-crewday]')
    await page.waitForTimeout(200)
    const ends = await page.evaluate(() => {
      const prev = document.querySelector('#eRoster .er-h .er-daynav[data-crewstep="-1"]') as HTMLButtonElement
      const next = document.querySelector('#eRoster .er-h .er-daynav[data-crewstep="1"]') as HTMLButtonElement
      return { prevDisabled: prev.disabled, nextDisabled: next.disabled }
    })
    expect(ends.prevDisabled).toBe(true)
    expect(ends.nextDisabled).toBe(false)
  })

  test('desktop: the day header and column headings stay pinned as the roster scrolls', async ({ page }) => {
    await page.setViewportSize(WIDE)
    await login(page)
    await go(page, 'editsched')
    await page.waitForSelector('#eRoster .rcol .rh')

    const m = await page.evaluate(() => {
      const er = document.getElementById('eRoster')!
      const erh = er.querySelector('.er-h') as HTMLElement
      const rh = er.querySelector('.rcol .rh') as HTMLElement
      // where the column heading naturally sits before any scroll
      const rhNatural = rh.getBoundingClientRect().top - er.getBoundingClientRect().top
      // scroll the panel as far down as it goes
      er.scrollTop = er.scrollHeight
      const erR = er.getBoundingClientRect()
      const hR = erh.getBoundingClientRect()
      const rhR = rh.getBoundingClientRect()
      return {
        scrolled: er.scrollTop,
        rhNatural,
        dayHeaderGap: Math.round(hR.top - erR.top),   // ~panel padding when pinned
        dayHeaderVisible: hR.bottom > erR.top && hR.top < erR.bottom,
        colHeadGap: Math.round(rhR.top - erR.top),     // pinned just under the day line
        colHeadVisible: rhR.bottom > erR.top && rhR.top < erR.bottom,
      }
    })

    // the seed roster is tall enough that the panel really scrolls — otherwise
    // there is nothing to pin and the test would prove nothing
    expect(m.scrolled, 'the palette actually has an overflow to scroll').toBeGreaterThan(60)
    expect(m.rhNatural, 'the column heading naturally starts well down the panel').toBeGreaterThan(50)
    // after scrolling to the bottom, both headings are still at the top, visible
    expect(m.dayHeaderVisible, 'the "Aircrew · <day>" line is still on screen').toBe(true)
    expect(m.dayHeaderGap, 'the day line is pinned to the panel top').toBeLessThan(14)
    expect(m.colHeadVisible, 'the "Pilots · N free" heading is still on screen').toBe(true)
    expect(m.colHeadGap, 'the column heading is pinned just under the day line').toBeLessThan(40)
  })

  test('desktop: › steps one clean day at a time to a whole-day end, then rolls into next week', async ({ page }) => {
    await page.setViewportSize(WIDE)
    await login(page)
    await go(page, 'editsched')
    await page.waitForSelector('#eWeek .day[data-day]')

    // This test measures the STEPPING logic — which day is at the front after
    // each arrow, that the run is contiguous, that Sat AND Sun reach the front,
    // and that the roll-over lands on Monday. panDays() computes that identically
    // whether the scroll is an instant jump or a settled smooth glide: it counts
    // from the position the press COMMANDED (panTgt), which an instant scroll
    // reaches exactly. What it does NOT need to re-prove is the glide animation:
    // that an in-flight glide is never cancelled mid-day (by the proxy-scrollbar
    // echo or a mid-glide repaint) is a real product guarantee, fixed in pan.ts
    // and pinned deterministically in pan.test.tsx. Under headless automation the
    // smooth glide itself is unreliable — it can fail to start, or stall — which
    // is a harness artifact, not a product fault, and it is what made a read
    // taken during the animation flake here. So neutralise the animation for this
    // one test — strip 'smooth' off scrollTo — and read the true settled day.
    await page.evaluate(() => {
      const proto = Element.prototype as any
      const origTo = proto.scrollTo
      proto.scrollTo = function (a: any) {
        if (a && typeof a === 'object') return origTo.call(this, { ...a, behavior: 'auto' })
        return origTo.apply(this, arguments)
      }
      // start on Monday
      const w = document.getElementById('eWeek')!; w.style.scrollBehavior = 'auto'; w.scrollLeft = 0
    })
    await page.waitForTimeout(150)

    // with the glide neutralised the scroll lands synchronously, so this only has
    // to confirm the position is stable — but keep the poll (not a fixed wait) so
    // the week-jump re-render on the roll-over is given its frame to commit.
    const settle = () => page.evaluate(() => new Promise<void>(res => {
      const w = document.getElementById('eWeek')!
      let last = -1, still = 0
      const iv = setInterval(() => {
        const s = Math.round(w.scrollLeft)
        if (s === last) { if (++still >= 3) { clearInterval(iv); res() } }
        else { still = 0; last = s }
      }, 40)
      setTimeout(() => { clearInterval(iv); res() }, 3000)
    }))

    // the day snapped nearest the week's left edge — the "front" day, sliver-proof
    const frontDay = () => page.evaluate(() => {
      const w = document.getElementById('eWeek')!, wl = w.getBoundingClientRect().left
      const days = [...w.querySelectorAll('.day[data-day]')] as HTMLElement[]
      let best = days[0], bd = Infinity
      for (const d of days) { const g = Math.abs(d.getBoundingClientRect().left - wl); if (g < bd) { bd = g; best = d } }
      return { day: +best.dataset.day!, gap: Math.round(bd) }
    })

    await settle()
    const seq: number[] = []
    let f = await frontDay(); seq.push(f.day)
    for (let i = 0; i < 8; i++) {
      await page.evaluate(() => { const n = document.getElementById('weekNext') as HTMLButtonElement | null; n && n.click() })
      await settle()
      f = await frontDay(); seq.push(f.day)
    }

    // collapse any consecutive duplicate readings (a settle that landed on the
    // same day twice is not a product event — the arrow still moved one day),
    // then assert the run is contiguous with no SKIP and rolls over to Monday.
    const steps = seq.filter((d, i) => i === 0 || d !== seq[i - 1])
    const wrapAt = steps.findIndex((d, i) => i > 0 && d < steps[i - 1])
    expect(wrapAt, 'the week rolls over to an earlier day at some point').toBeGreaterThan(0)
    const beforeWrap = steps.slice(0, wrapAt)
    for (let i = 1; i < beforeWrap.length; i++) {
      expect(beforeWrap[i], `each step advances exactly one day (no skipped Sat/Sun)`).toBe(beforeWrap[i - 1] + 1)
    }
    // AND the weekend genuinely reaches the front before the roll-over — the bug
    // (owner, 23 Aug 26 — "Saturday and Sunday out of selection") was that the
    // arrow crossed with Friday still at the front. The contiguity check alone
    // never caught it (a short run 0..4 is contiguous too), so pin the reach.
    expect(beforeWrap, 'Saturday reaches the front').toContain(5)
    expect(beforeWrap, 'Sunday reaches the front before the week rolls over').toContain(6)
    // the roll-over lands on Monday of the next week
    expect(steps[wrapAt], 'stepping past the last front day rolls to Monday').toBe(0)

    // and the end of the week is a whole column flush at the left — never a
    // fractional sliver of a prior day (leading pad is ~20px; a sliver was 100s).
    // One settled reading at the jammed end, so the check can't catch a scroll
    // still in flight.
    await page.evaluate(() => { const w = document.getElementById('eWeek')!; w.scrollLeft = w.scrollWidth })
    await settle()
    // at the absolute end the fronting column may be a next-week PREVIEW day —
    // the no-sliver contract holds for any column, so measure them all.
    const end = await page.evaluate(() => {
      const w = document.getElementById('eWeek')!, wl = w.getBoundingClientRect().left
      let bd = Infinity
      for (const d of w.querySelectorAll('.day')) { const g = Math.abs(d.getBoundingClientRect().left - wl); if (g < bd) bd = g }
      return Math.round(bd)
    })
    expect(end, 'the last stop is a whole column flush at the left, not a sliver').toBeLessThan(40)
  })
})

/* ===================================================================
   The mobile Quals freeze + the collapsible legend (owner, 15 Aug 26).
   Both are geometry: jsdom has no sticky positioning and no display:none
   layout, so the frozen column and the closed-by-default legend are gated
   here on the real build. =================================================== */
test.describe('the frozen callsign column', () => {
  test('phone: the callsign stays at the left edge when the Quals table scrolls sideways', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await login(page)
    await go(page, 'quals')
    await page.waitForSelector('#qtbl td.qname')
    const m = await page.evaluate(() => {
      const wrap = document.querySelector('.qwrap') as HTMLElement
      const name = document.querySelector('#qtbl td.qname') as HTMLElement
      const other = document.querySelector('#qtbl td.qcell') as HTMLElement
      const nameBefore = name.getBoundingClientRect().left
      const otherBefore = other.getBoundingClientRect().left
      wrap.scrollLeft = 400
      return {
        scrolled: wrap.scrollLeft,
        nameMoved: Math.round(name.getBoundingClientRect().left - nameBefore),
        otherMoved: Math.round(other.getBoundingClientRect().left - otherBefore),
      }
    })
    expect(m.scrolled, 'the table really scrolled sideways').toBeGreaterThan(200)
    expect(Math.abs(m.nameMoved), 'the callsign column stays put while the table scrolls').toBeLessThan(3)
    expect(m.otherMoved, 'a normal cell scrolled away with the table').toBeLessThan(-200)
  })
})

test.describe('the collapsible legend', () => {
  test('phone: the legend is closed by default and opens on click', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await login(page)
    await go(page, 'editsched')
    await page.waitForSelector('#eLegendBox summary.legend-sum')
    const closed = await page.evaluate(() => (document.querySelector('#eLegend') as HTMLElement).offsetHeight)
    expect(closed, 'the key is hidden until asked for').toBe(0)
    await page.click('#eLegendBox summary.legend-sum')
    await page.waitForTimeout(150)
    const open = await page.evaluate(() => (document.querySelector('#eLegend') as HTMLElement).offsetHeight)
    expect(open, 'clicking the summary reveals the key').toBeGreaterThan(0)
  })
})

/* THE FLYING LINE'S BOXES SIT ON ONE BASELINE ON A PHONE (owner, 16 Aug 26 —
   "make the boxes aligned … every box lowers to cater for the brief blue
   timing"). The B cell stacks the blue suggested brief time above its input,
   and on a phone the seat pucks drop to their own row, so this first row's
   height is set by that taller B cell. A centred row floated CS/MSN/TO/LD half
   a line above the brief box; the fix bottom-aligns the five boxes so they
   share one line, the blue time taking the freed space directly above the
   brief box. jsdom cannot see it — the alignment only exists once the
   stylesheet lays the grid out. */
test('the flying line keeps its five boxes on one baseline on a phone', async ({ page }) => {
  await page.setViewportSize(PHONE)
  await login(page)
  await go(page, 'editsched')
  await page.evaluate(() => (window as any).openScheduler(1))
  await page.waitForSelector('#schedBoard .sb-line .bsug')

  const m = await page.evaluate(() => {
    const line = [...document.querySelectorAll('#schedBoard .sb-line')]
      .find(l => l.querySelector('.bsug'))
    if (!line) return null
    const bottom = (el: Element | null) => el ? el.getBoundingClientRect().bottom : NaN
    const cs = line.querySelector('.lin'), msn = line.querySelector('.msn')
    const tms = [...line.querySelectorAll(':scope > .tm')] // TO, LD
    const brief = line.querySelector('.sb-bcell .tm')
    const bsug = line.querySelector('.bsug')
    const bots = [cs, msn, tms[0], tms[1], brief].map(bottom)
    return {
      spread: Math.max(...bots) - Math.min(...bots),
      briefBottom: bottom(brief),
      bsugBottom: bottom(bsug),
    }
  })
  test.skip(!m, 'no brief-suggestion line on the seed board')

  /* every box shares one bottom edge (sub-pixel rounding only) */
  expect(m!.spread, 'the five boxes sit on one baseline').toBeLessThan(1.5)
  /* and the blue time sits ABOVE the brief box, not beside or below it */
  expect(m!.bsugBottom, 'the blue brief time rides above the brief box')
    .toBeLessThan(m!.briefBottom - 4)
})

/* NOTHING ON THE BOARD HIDES UNDER THE PARKED AIRCREW TAB (owner, 16 Aug 26).
   The parked aircrew drawer is a ~30px sliver pinned over the right edge in a
   ~55vh band; an 18px gutter only kept it off the input tap-zone, so panel
   headers, the +Note/+Item buttons and the sign-off summary still slid under
   the blue tab. A 30px right gutter on the three scroller children clears it.
   jsdom cannot see it — the tab is positioned and the gutter is a phone rule. */
test('the phone board clears its parked aircrew tab', async ({ page }) => {
  await page.setViewportSize(PHONE)
  await login(page)
  await go(page, 'editsched')
  await page.evaluate(() => (window as any).openScheduler(0))
  await page.waitForSelector('#schedBoard .sb-line')
  await page.waitForTimeout(300)

  const m = await page.evaluate(() => {
    const tab = document.querySelector('#rosTab')!.getBoundingClientRect()
    let maxRight = 0
    // the full-width chrome the tab used to cover: panel headers, row/section
    // buttons, and everything in the sign-off and checks strips
    const sel = '#schedBoard .sb-ph, #schedBoard .mbtn, #schedBoard .sb-sign *, #schedBoard .sb-warn *'
    for (const e of document.querySelectorAll(sel)) {
      const b = e.getBoundingClientRect()
      if (b.width > 0 && b.top < tab.bottom && b.bottom > tab.top) maxRight = Math.max(maxRight, b.right)
    }
    return { tabLeft: Math.round(tab.left), contentRight: Math.round(maxRight) }
  })
  /* no board chrome reaches past the tab's left edge (sub-pixel slack only) */
  expect(m.contentRight, 'board content stops at or before the aircrew tab').toBeLessThanOrEqual(m.tabLeft + 1)
})

/* ---- the board's remarks boxes: aligned, and they grow (owner, 20 Aug 26) ----

   TWO asks in one screenshot. He ringed the dead strip between a duty row's
   puck stack and its Rmks box and asked for the box to "follow where the red
   line is drawn … aligned with where the live flights remarks extend to", for
   every panel EXCEPT Common Programme. And then: "if the text overflows, the
   text box will grow vertically. Apply this to all text box as well."

   Both are invisible to Vitest — jsdom reports every rect 0x0, so it can prove
   which element was emitted and nothing about where it sits or how tall it got.
   These are the measurements. */
test('the phone board: duty/sim/ground AND Common Programme remarks align with the flying line', async ({ page }) => {
  await page.setViewportSize(PHONE)
  await login(page)
  await go(page, 'editsched')
  await page.evaluate(() => (window as any).openScheduler(0))
  await page.waitForSelector('#schedBoard .sb-line')
  await page.waitForTimeout(300)

  const m = await page.evaluate(() => {
    const L = (e: Element) => Math.round(e.getBoundingClientRect().left)
    const W = (e: Element) => Math.round(e.getBoundingClientRect().width)
    const fly = document.querySelector('#sbBoard .sb-line .nts')!
    const c6r = [...document.querySelectorAll('#sbBoard .sb-arow.c6r .rmkin')]
    const prog = [...document.querySelectorAll('#sbBoard .sb-panel.prog .sb-arow.c6r .rmkin')]
    return {
      flyLeft: L(fly), flyWidth: W(fly),
      c6rCount: c6r.length,
      c6rLefts: [...new Set(c6r.map(L))],
      c6rWidths: [...new Set(c6r.map(W))],
      progCount: prog.length,
      progLefts: [...new Set(prog.map(L))],
      progWidths: [...new Set(prog.map(W))],
    }
  })

  expect(m.c6rCount, 'the day draws duty/sim/ground rows').toBeGreaterThan(0)
  /* ONE left edge across every c6r panel, and it is the flying line's */
  expect(m.c6rLefts, 'every remarks box starts at one x').toHaveLength(1)
  expect(m.c6rLefts[0], 'and that x is the flying line\'s remarks box').toBe(m.flyLeft)
  expect(m.c6rWidths[0], 'same width, so the right edges agree too').toBe(m.flyWidth)

  /* Common Programme now rides the SAME c6r grid (owner, 22 Aug 26 — reversed
     the earlier "all except common programme"), so its remarks box aligns with
     the flying line exactly like the duty/sim/ground rows do. */
  expect(m.progCount, 'the Common Programme draws its rows').toBeGreaterThan(0)
  expect(m.progLefts, 'its remarks all start at one x too').toHaveLength(1)
  expect(m.progLefts[0], 'and that x is the flying line\'s').toBe(m.flyLeft)
  expect(m.progWidths[0], 'same width as the flying line\'s box').toBe(m.flyWidth)
})

test('the phone board: a long remark grows its box instead of scrolling inside it', async ({ page }) => {
  await page.setViewportSize(PHONE)
  await login(page)
  await go(page, 'editsched')
  await page.evaluate(() => (window as any).openScheduler(0))
  await page.waitForSelector('#schedBoard .sb-line')
  await page.waitForTimeout(300)

  const box = page.locator('#sbBoard .sb-panel.duty .sb-arow.c6r .rmkin').first()
  await box.scrollIntoViewIfNeeded()
  const rest = await box.evaluate(e => Math.round(e.getBoundingClientRect().height))

  await box.fill('SDO swapped with Bane who has the PHA at 1700 and Pike covers the last hour of it')
  const grown = await box.evaluate((e: any) => ({
    h: Math.round(e.getBoundingClientRect().height),
    hidden: e.scrollHeight - e.clientHeight,
  }))
  expect(grown.h, 'the box got taller').toBeGreaterThan(rest)
  expect(grown.hidden, 'and no text is hidden behind an inner scroll').toBeLessThanOrEqual(1)

  /* ONE unbroken word longer than the box — the overflow case HANDOFF has
     carried as open since 12 Aug 26. overflow-wrap:anywhere is what stops it
     running out of the row rather than breaking. */
  await box.fill('X'.repeat(120))
  const long = await box.evaluate((e: any) => {
    const r = e.getBoundingClientRect(), row = e.closest('.sb-arow').getBoundingClientRect()
    return { spills: r.right > row.right + 1, scrolls: e.scrollWidth > e.clientWidth + 1 }
  })
  expect(long.spills, 'a long unbroken word does not push the box out of its row').toBe(false)
  expect(long.scrolls, 'and it breaks rather than scrolling sideways').toBe(false)

  /* the time cells beside it are deliberately NOT textareas — nothing in
     `0715` wraps, and the guard rails already refuse a non-time */
  const tags = await page.evaluate(() =>
    [...new Set([...document.querySelectorAll('#sbBoard .atm, #sbBoard .sb-line .tm')].map(e => e.tagName))])
  expect(tags, 'every time cell is still a one-line input').toEqual(['INPUT'])
})

/* THE INSIGHTS BARS ACTUALLY DRAW (20 Aug 26). `.ibar .fill` is a <span>
   carrying `height:100%` and an inline `width:N%` — and a span is
   `display:inline`, where neither applies. It measured 0x0: the flying-load
   bars had been drawing an empty track since they shipped, and the work-hours
   section added the same day would have shipped just as blank. jsdom cannot
   see this — it reports EVERY rect as 0x0, so a unit test cannot tell a bar
   that draws from one that does not. This is the only gate that can.

   Pinned as a proportion, not a pixel count: the longest row is a full track
   and a shorter one is strictly shorter, which is what makes it a BAR CHART
   rather than a row of identical blocks. */
test('the Insights bars draw, and their lengths mean something', async ({ page }) => {
  await login(page)
  await page.click('#insightBtn')
  await page.waitForSelector('#insightBody .ibar')

  const m = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('#insightBody .ibar')].map(r => ({
      track: r.querySelector('.track')!.getBoundingClientRect().width,
      fill: r.querySelector('.fill')!.getBoundingClientRect().width,
      fillH: r.querySelector('.fill')!.getBoundingClientRect().height,
      v: r.querySelector('.v') as HTMLElement,
    }))
    return {
      n: rows.length,
      first: { track: rows[0].track, fill: rows[0].fill, h: rows[0].fillH },
      ratios: rows.map(r => r.fill / r.track),
      /* a value that does not fit its cell is a number the reader cannot
         trust — "25h35" is what widened it from 22px */
      clipped: rows.filter(r => r.v.scrollWidth > r.v.getBoundingClientRect().width + 0.5).length,
      headings: [...document.querySelectorAll('#insightBody .isec-h')].map(h => h.textContent || ''),
    }
  })

  expect(m.n, 'the panel drew bars at all').toBeGreaterThan(5)
  expect(m.first.h, 'the fill has height — a display:inline span has none').toBeGreaterThan(6)
  expect(m.first.fill, 'the longest row fills its track').toBeGreaterThan(m.first.track * 0.9)
  expect(Math.min(...m.ratios), 'and a shorter row is genuinely shorter').toBeLessThan(0.95)
  expect(m.clipped, 'no value is clipped by its own cell').toBe(0)
  expect(m.headings.some(h => h.startsWith('Work hours')), 'the work-hours section is there').toBe(true)
})

/* The desktop checks panel is resizable against the roster (owner, Aug 26 —
   "move the border to reduce the amount of warning shown. Vice versa"). jsdom
   cannot see the drag change a height; only a real browser can. The grip is a
   no-op until dragged (default 38% content-sizing), so the rest of the board's
   geometry is unaffected — this pins that dragging it actually grows the panel. */
test('the desktop checks panel resizes by its grip', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await login(page); await go(page, 'editsched')
  await page.evaluate(() => (window as any).openScheduler(0))
  await page.waitForSelector('#schedBoard .sb-line')
  const grip = page.locator('#schedBoard .sb-wsplit')
  await expect(grip).toBeVisible()
  const before = (await page.locator('#schedBoard .sb-warn').boundingBox())!.height
  const box = (await grip.boundingBox())!
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2
  await page.mouse.move(cx, cy)
  await page.mouse.down()
  await page.mouse.move(cx, cy + 90, { steps: 10 })
  await page.mouse.up()
  const after = (await page.locator('#schedBoard .sb-warn').boundingBox())!.height
  expect(after, 'dragging the grip down grows the checks panel').toBeGreaterThan(before + 40)
})

/* The Inputs list is a grid of ALIGNED columns on a phone (owner, 22 Aug 26 —
   "u can put callsign. Then. Leave some space then align the reason, then the
   date… below the callsign u can put the remarks"). The old flex-wrap let each
   card's own chip width push its date around, and jsdom cannot see a column
   line up across separate cards — this page had no e2e at all until now. Also
   pins the SANS chip's phone short form: the .bl tail ("ability") hides under
   820px so the chip reads SANS AVAIL, while the DOM text stays the full type. */
test('the phone Inputs cards align their type and date columns', async ({ page }) => {
  await page.setViewportSize(PHONE)
  await login(page); await go(page, 'inputs')
  /* the default today→two-weeks window is EMPTY on the demo data by design
     (owner, 12 Aug 26 — do not "fix" it): All dates is the way to rows,
     exactly as a user is told by the empty state */
  await page.click('#inRangeBtn')
  await page.click('#inRangeAll')
  await page.waitForSelector('#inBody tr .intag')
  const m = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('#inBody tr:not(.ined)')] as HTMLElement[]
    const chipX = rows.map(r => r.querySelector('.intag')?.getBoundingClientRect().left).filter(x => x != null) as number[]
    const dateX = rows.map(r => (r.querySelector('td[data-label="Start"]') as HTMLElement).getBoundingClientRect().left)
    const bl = document.querySelector('#inBody .intag .bl') as HTMLElement | null
    /* remarks sit BELOW the callsign, starting at the card's left edge */
    const withRk = rows.find(r => { const rk = r.querySelector('td[data-label="Remarks"]') as HTMLElement | null; return !!rk && rk.offsetHeight > 0 })
    let below: any = null
    if (withRk) {
      const name = withRk.querySelector('td[data-label="Name"]')!.getBoundingClientRect()
      const rk = withRk.querySelector('td[data-label="Remarks"]')!.getBoundingClientRect()
      below = { nameBottom: name.bottom, rkTop: rk.top, nameLeft: name.left, rkLeft: rk.left }
    }
    return { n: chipX.length, chipX, dateX, sansTail: bl ? getComputedStyle(bl).display : null, below }
  })
  expect(m.n, 'enough cards on screen to prove alignment').toBeGreaterThan(3)
  for (const x of m.chipX) expect(Math.abs(x - m.chipX[0]), 'every type chip starts at the same x').toBeLessThan(1.5)
  for (const x of m.dateX) expect(Math.abs(x - m.dateX[0]), 'every date starts at the same x').toBeLessThan(1.5)
  expect(m.sansTail, 'the SANS tail is hidden on a phone — the chip reads SANS AVAIL').toBe('none')
  expect(m.below, 'a card carrying remarks exists in the demo data').toBeTruthy()
  expect(m.below.rkTop, 'remarks sit below the callsign line').toBeGreaterThanOrEqual(m.below.nameBottom - 0.5)
  expect(Math.abs(m.below.rkLeft - m.below.nameLeft), 'and start under it').toBeLessThan(1.5)
})

/* --------------------------------------------------------------------------
   THE INPUTS MONTH CALENDAR (owner ask, 22 Aug 26). jsdom pins the grid's
   COUNT (7 columns of cells in the markup) but not its geometry — only a
   real layout engine can prove the columns come out equal, that the overlay
   really fills the viewport, and that a chip never paints outside its own
   day cell. The phone check also pins the owner-approved compact form:
   chips are bare colour bars, not text. */
test.describe('the Inputs month calendar', () => {
  for (const [name, viewport] of [['phone', PHONE], ['desktop', DESK]] as const) {
    test(`fills the viewport with 7 equal columns, chips inside their cells, on ${name}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await login(page)
      await go(page, 'inputs')
      await page.click('#inCalBtn')
      await page.waitForSelector('#inpCal')

      /* the overlay is the whole screen — that is what "full screen" means */
      const box = await page.evaluate(() => {
        const r = document.getElementById('inpCal')!.getBoundingClientRect()
        return { x: r.x, y: r.y, w: r.width, h: r.height, iw: innerWidth, ih: innerHeight }
      })
      expect(box.x).toBe(0); expect(box.y).toBe(0)
      expect(Math.abs(box.w - box.iw)).toBeLessThan(1)
      expect(Math.abs(box.h - box.ih)).toBeLessThan(1)

      /* seven equal columns — the first grid row, blanks included, and no
         horizontal spill past the overlay's own right edge */
      const cols = await page.evaluate(() => {
        const cells = [...document.querySelectorAll('.ic-grid>*')].slice(0, 7)
        const ws = cells.map(el => +el.getBoundingClientRect().width.toFixed(1))
        const right = Math.max(...[...document.querySelectorAll('.ic-grid>*')].map(el => el.getBoundingClientRect().right))
        return { n: cells.length, ws, right, iw: innerWidth }
      })
      expect(cols.n).toBe(7)
      for (const w of cols.ws) expect(Math.abs(w - cols.ws[0]), 'columns are equal within a px').toBeLessThan(1.5)
      expect(cols.right, 'the grid never scrolls the page sideways').toBeLessThanOrEqual(cols.iw + 0.5)

      /* step to the seeded demo month (July 2026) — bounded, not hardcoded:
         the seed month follows the real clock, so walk ‹ until the title
         reads out, and fail loudly if two years of clicks never find it */
      for (let i = 0; i < 24; i++) {
        if ((await page.locator('.ic-mon').textContent()) === 'July 2026') break
        await page.click('#icPrev')
      }
      expect(await page.locator('.ic-mon').textContent()).toBe('July 2026')
      await page.waitForSelector('.ic-chip')

      /* every chip paints inside its own day cell — the one geometric
         promise the whole month view rests on */
      const stray = await page.evaluate(() => {
        const bad: any[] = []
        for (const cell of document.querySelectorAll('[data-icday]')) {
          const c = cell.getBoundingClientRect()
          for (const chip of cell.querySelectorAll('.ic-chip')) {
            const r = chip.getBoundingClientRect()
            if (r.left < c.left - 0.5 || r.right > c.right + 0.5 || r.top < c.top - 0.5 || r.bottom > c.bottom + 0.5)
              bad.push({ day: (cell as HTMLElement).dataset.icday, chip: { l: r.left, r: r.right, t: r.top, b: r.bottom }, cell: { l: c.left, r: c.right, t: c.top, b: c.bottom } })
          }
        }
        return bad.slice(0, 4)
      })
      expect(stray, 'no chip paints outside its day cell').toEqual([])

      if (name === 'phone') {
        /* the owner-approved phone form: chips shrink to colour bars */
        const h = await page.evaluate(() => [...document.querySelectorAll('.ic-chip')]
          .map(el => +el.getBoundingClientRect().height.toFixed(1)))
        expect(h.length).toBeGreaterThan(0)
        for (const v of h) expect(v, 'phone chips are compact colour bars').toBeLessThanOrEqual(10)
      }
      await page.click('#icClose')
    })
  }
})

/* The phone day-head is TWO FIXED ROWS whatever the title says (owner,
   25 Aug 26 — "Because of the word today, the layout is not the same
   between these … keep it similar"). The head used to be one wrapping flex
   row, so the extra width of "· Today" moved the 4x4 badge and the publish
   cluster to different rows on different days. Pinned: every control sits
   at the same offset within the head on the Today day and any other day,
   and the desktop head stays one row. scheduler.css's ordered break — and
   the reason this is an e2e pin: the fix first landed inside the WRONG
   media block (the desktop one) and no unit test can see a media query.
   The two control spans (.dhtpl/.dstat) are display:contents on phone (owner,
   26 Aug 26 — compress the cluster into two rows), so they carry no box of
   their own: the controls are measured through their pills (a Templates
   button, the publish control), not the vanished span wrappers. */
test.describe('the day-head lays out the same on every day', () => {
  test('phone: Today does not move the controls; desktop: one row', async ({ page }) => {
    await page.setViewportSize(PHONE)
    await login(page)
    await go(page, 'editsched')
    const today = await page.locator('#page-editsched .day.today[data-day]').count()
    expect(today, 'the demo week carries a Today day — the case under test').toBeGreaterThan(0)
    const head = (di: number) => page.evaluate(di => {
      const h = document.querySelector(`#page-editsched .day[data-day="${di}"] .day-head`)!
      const hb = h.getBoundingClientRect()
      const at = (sel: string) => {
        const el = h.querySelector(sel)
        if (!el) return null
        const r = el.getBoundingClientRect()
        return { top: Math.round(r.top - hb.top), left: Math.round(r.left - hb.left) }
      }
      return { badge: at('.badge'), tpl: at('.dhtpl .dhbtn'), stat: at('.dstat .dbeak'), h: Math.round(hb.height) }
    }, di)
    const mon = await head(0), tue = await head(1)
    expect(mon, 'Monday (Today) and Tuesday heads are geometrically identical').toEqual(tue)
    expect(mon.badge!.top, 'the 4x4 badge holds row one').toBeLessThan(30)
    expect(mon.tpl!.top, 'Templates/Drafts hold row two').toBeGreaterThan(30)
    await page.setViewportSize(DESK)
    await page.waitForTimeout(400)
    const wide = await head(0)
    expect(Math.abs(wide.badge!.top - wide.tpl!.top), 'desktop keeps one row').toBeLessThanOrEqual(4)
  })
})

/* The motion set (owner, 25 Aug 26 — critique follow-up, approved scope
   "only do the motion"): pages fade in (pagein), the board slides up
   (boardup), and BOTH go instant under reduced motion via the blanket
   `*{animation:none!important}` rule. Pinned in a real browser because
   jsdom computes no styles: this is the only gate that can prove the
   animations exist AND that the reduced-motion switch really reaches them. */
test.describe('the motion set, and its reduced-motion off-switch', () => {
  test('pages and the board animate; reduced motion computes none', async ({ page }) => {
    await page.setViewportSize(DESK)
    await login(page)
    const anim = (sel: string) => page.evaluate(s => getComputedStyle(document.querySelector(s)!).animationName, sel)
    expect(await anim('#page-viewsched'), 'the shown page carries its fade').toBe('pagein')
    await go(page, 'editsched')
    await page.click('#page-editsched .day[data-day="0"] .dt.sb-open')
    await page.waitForSelector('#schedBoard:not([hidden])')
    expect(await anim('#schedBoard'), 'the open board carries its rise').toBe('boardup')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    expect(await anim('#page-editsched'), 'reduced motion silences the page fade').toBe('none')
    expect(await anim('#schedBoard'), 'reduced motion silences the board rise').toBe('none')
    await page.emulateMedia({ reducedMotion: null })
  })
})
