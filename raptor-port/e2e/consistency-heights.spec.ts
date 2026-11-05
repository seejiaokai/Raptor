/* Round 3 of the consistency look, his answers 5–7 (owner, 21 Oct 26 — "yes all"), measured in a real browser: jsdom has
   no layout, so a size rule passes every unit test whether or not it draws.
   - D1138: Help's and Admin's titles take Logic's page name's size and weight (18px / 700; 16px on a phone), in their place.
   - D1139: on a desktop the Inputs list's "+ Input" and dates button are 36 tall, as the rest of the Inputs page.
   - D1170: every control on the Tracker's bar is as tall as its dropdowns — and only the bar's: a menu's items keep theirs,
     and the bar itself grows no taller. */
import { expect, test, type Page } from '@playwright/test'
import { go, login } from './app'

const PHONE = { width: 390, height: 844 }
const DESK = { width: 1536, height: 864 }

const nav = async (page: Page, to: string) => {
  await page.evaluate(p => (window as any).go(p), to)
  await page.waitForFunction(p => (window as any).CURPAGE === p, to)
  await page.waitForTimeout(350)
}
const font = (page: Page, sel: string) => page.evaluate(s => {
  const e = document.querySelector(s) as HTMLElement | null
  if (!e) return null
  const c = getComputedStyle(e)
  return { size: c.fontSize, weight: c.fontWeight, spacing: c.letterSpacing, shown: e.getBoundingClientRect().height > 0 }
}, sel)
const tall = (page: Page, sel: string) => page.evaluate(s => {
  const e = document.querySelector(s) as HTMLElement | null
  return e && e.getClientRects().length ? Math.round(e.getBoundingClientRect().height * 10) / 10 : null
}, sel)

for (const [name, vp] of [['desktop', DESK], ['phone', PHONE]] as const) {
  test(`${name}: Help's and Admin's titles wear Logic's page name's size and weight (D1138)`, async ({ page }) => {
    await page.setViewportSize(vp)
    await login(page)
    await go(page, 'logic')
    const logic = await font(page, '#page-logic h1')
    expect(logic, 'Logic names its page').not.toBeNull()
    expect(logic!.size).toBe(name === 'phone' ? '16px' : '18px')
    for (const [pg, sel] of [['help', '#page-help h2'], ['admin', '#page-admin .adm-rail h2']]) {
      await nav(page, pg)
      const t = await font(page, sel)
      expect(t, pg + ' has its title').not.toBeNull()
      expect(t!.shown, pg + "'s title is on screen").toBe(true)
      expect({ size: t!.size, weight: t!.weight, spacing: t!.spacing }, pg + "'s title is Logic's").toEqual({ size: logic!.size, weight: logic!.weight, spacing: logic!.spacing })
    }
  })
}

test('desktop: the Inputs list\'s "+ Input" and dates button are 36 tall, as the page\'s other buttons (D1139)', async ({ page }) => {
  await page.setViewportSize(DESK)
  await login(page)
  await go(page, 'inputs')
  await page.click('#inListBtn')
  await page.waitForSelector('.inputs-listtools #inNew', { state: 'visible' })
  for (const id of ['#inNew', '#inRangeBtn', '#inCalBtn', '#inListBtn']) expect(await tall(page, id), id).toBe(36)
  /* one line still: the dates button's calendar sits beside its dates (D1137) */
  const oneLine = await page.evaluate(() => {
    const b = document.getElementById('inRangeBtn')!, g = b.querySelector('.btnglyph')!.getBoundingClientRect(), r = b.getBoundingClientRect()
    return g.top >= r.top && g.bottom <= r.bottom
  })
  expect(oneLine, 'the dates button is one line').toBe(true)
  /* drawn 36, pressed 46, as the row above's buttons (D698, D1125): a press 3px above each still meets it */
  for (const id of ['inNew', 'inRangeBtn']) {
    const meets = await page.evaluate(id => { const b = document.getElementById(id)!, r = b.getBoundingClientRect(), h = document.elementFromPoint(r.left + r.width / 2, r.top - 3); return !!h && (h === b || b.contains(h)) }, id)
    expect(meets, `a press 3px above #${id} meets it`).toBe(true)
  }
})

for (const [name, vp, h] of [['desktop', DESK, 30], ['phone', PHONE, 26]] as const) {
  test(`${name}: every control on the Tracker's bar is as tall as its dropdowns, ${h} (D1170)`, async ({ page }) => {
    await page.setViewportSize(vp)
    await login(page)
    await go(page, 'tracker')
    await page.waitForSelector('#flowSvg .ball', { timeout: 20000 })
    await page.waitForTimeout(300)
    for (const id of ['#activeSel', '#courseSel', '#sylSel']) expect(await tall(page, id), id + ', the dropdown').toBe(h)
    /* every button drawn on the bar at this width, read off the page so a new one cannot slip past */
    const bar = await page.evaluate(() => {
      const hd = document.querySelector('#page-tracker header')!
      return [...hd.querySelectorAll('button, .findbox')].filter(b => b.getClientRects().length && !b.closest('.menupanel'))
        .map(b => ({ id: b.id || b.textContent!.trim(), h: Math.round(b.getBoundingClientRect().height * 10) / 10 }))
    })
    expect(bar.length, 'the bar has its buttons').toBeGreaterThan(5)
    /* none taller than the dropdowns either, so the bar grows no taller than they made it */
    for (const b of bar) expect(b.h, b.id).toBe(h)
    /* a menu's items keep their own size: open the Course menu */
    await page.click('#courseMenuBtn')
    await page.waitForSelector('#courseMenuPanel.on')
    const item = await tall(page, '#addCourse')
    expect(item, 'a menu item is not stretched to the bar').not.toBe(h)
  })
}

/* ROUND 4 (owner D1702, 5 Nov 26 — "all as recommended"): the Inputs calendar's filters and gear wrap as ONE group at the
   row's right end, so the gear never stands alone on a line; and between 1340 and 1439 wide the search box is narrower, so
   1366 holds one line. Found by the round's walk: the narrower box's rule was written above the rule it narrows and lost
   to it — the row stayed two lines at 1366 (the group did wrap together; at 1340 it wraps by design — the ruling holds one line at 1366). */
for (const w of [1440, 1366]) {
  test(`desktop ${w}: the Inputs calendar's top row is one line, the gear at its right end (D1702)`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 768 })
    await login(page)
    await go(page, 'inputs')
    const m = await page.evaluate(() => {
      const r = (s: string) => document.querySelector(s)!.getBoundingClientRect()
      const top = r('.inputs-top'), g = r('#inGear'), v = r('.inputs-views')
      return { gearTop: Math.round(g.top), viewsTop: Math.round(v.top), gearRight: Math.round(top.right - g.right), search: Math.round(r('label.inputs-search').width) }
    })
    expect(m.gearTop, 'the gear on the switch\'s line').toBe(m.viewsTop)
    expect(m.gearRight, 'at the row\'s right end').toBeLessThanOrEqual(1)
    expect(m.search, '"Search inputs" still whole').toBeGreaterThanOrEqual(96)
  })
}
for (const w of [1340, 1300, 1280]) {
  test(`desktop ${w}: the filters and the gear wrap together — the gear never alone, at the row's right end (D1702)`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 768 })
    await login(page)
    await go(page, 'inputs')
    const m = await page.evaluate(() => {
      const r = (s: string) => document.querySelector(s)!.getBoundingClientRect()
      return { gearTop: Math.round(r('#inGear').top), fieldsTop: Math.round(r('#inFilters').top), gearRight: Math.round(r('.inputs-top').right - r('#inGear').right) }
    })
    expect(m.gearTop, 'the gear on the fields\' line').toBe(m.fieldsTop)
    expect(m.gearRight, 'at the row\'s right end').toBeLessThanOrEqual(1)
  })
}
