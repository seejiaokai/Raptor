// Chat 7, the LOOK for his D1843 (8 Nov 26, "A, as recommended" — the desktop Inputs list closed by a thin line round it,
// in the rows' own line colour, and "No document" inside its column): the list at 821, 1024, his PC's 1536 and a wide
// 2560, AFTER (as built) and BEFORE (the line taken off and "No document"'s old 11px margins put back by a style laid over
// the same build, for the picture only); at 1536 also with the input window open, where the list makes room (D1787) and
// with the just-added mark on a new row; and the phone's list, which draws cards and is unchanged. Measured at each:
// where "No document" ends against its cell and the list's end, the line as drawn (the pixel just past the list's right
// edge), the column widths (unchanged), and any sideways scroll. Served from the built bundle by the drawing check's own
// route (no server).
// Run (from raptor-port/, after a build): node docs/img/handpass/2026-11-08-chat7-inputs/d1843-look.mjs
import { chromium, LAUNCH, serveDist } from '../../../../scripts/drawcheck/lib.mjs'
import { writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = dirname(fileURLToPath(import.meta.url))
const DIST = resolve(OUT, '../../../../dist')
const ORIGIN = 'http://localhost:4293'
const BEFORE = '#intbl{box-shadow:none !important}.inact>span.in-nodoc{margin:0 11px !important}'
const res = {}
const errors = []

async function open(browser, opts) {
  const ctx = await browser.newContext({ deviceScaleFactor: 2, ...opts })
  await serveDist(ctx, ORIGIN, DIST)
  await ctx.clock.install({ time: new Date('2026-07-13T09:00:00+08:00') })
  const page = await ctx.newPage()
  page.on('pageerror', e => errors.push(String(e)))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  await page.goto(ORIGIN + '/')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(500)
  await page.addStyleTag({ content: '.toast,.snack{display:none!important}' })
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(700)
  if (!(await page.locator('#intbl, #inBody, #inList').first().isVisible().catch(() => false))) {
    await page.locator('#inListBtn').first().click(); await page.waitForTimeout(500)
  }
  return { ctx, page }
}

const measure = page => page.evaluate(() => {
  const tbl = document.querySelector('#intbl'); if (!tbl) return { table: false }
  const t = tbl.getBoundingClientRect(), wrap = document.querySelector('.inwrap')
  const nodoc = [...document.querySelectorAll('#inBody .in-nodoc')].map(s => {
    const b = s.getBoundingClientRect(), td = s.closest('td'), c = td.getBoundingClientRect()
    return { spill: Math.round(b.right - (c.right - parseFloat(getComputedStyle(td).paddingRight))), toEnd: Math.round(t.right - b.right) }
  })
  return {
    table: { left: Math.round(t.left), right: Math.round(t.right) },
    cols: [...document.querySelectorAll('#intbl thead th')].map(th => Math.round(th.getBoundingClientRect().width)),
    nodoc: { n: nodoc.length, maxSpill: Math.max(-999, ...nodoc.map(n => n.spill)), minToEnd: Math.min(999, ...nodoc.map(n => n.toEnd)) },
    shadow: getComputedStyle(tbl).boxShadow,
    listSideways: wrap.scrollWidth > wrap.clientWidth, pageSideways: document.documentElement.scrollWidth > innerWidth,
  }
})
// the list from its headings down seven rows, the page's margin each side kept in
const listBox = page => page.evaluate(() => {
  const t = document.querySelector('#intbl').getBoundingClientRect()
  const rows = [...document.querySelectorAll('#inBody tr')].slice(0, 7)
  const bottom = rows.length ? rows[rows.length - 1].getBoundingClientRect().bottom : t.bottom
  return { x: 0, y: Math.max(0, t.top - 12), width: innerWidth, height: Math.min(bottom + 12, innerHeight) - Math.max(0, t.top - 12) }
})
async function shoot(page, w, name) {
  const box = await listBox(page), m = await measure(page)
  await page.screenshot({ path: join(OUT, `d1843-${w}-${name}.png`), clip: box })
  const x = Math.max(0, m.table.right - 260)
  await page.screenshot({ path: join(OUT, `d1843-${w}-${name}-end.png`), clip: { x, y: box.y, width: Math.min(300, w - x), height: box.height } })
  return m
}

const browser = await chromium.launch(LAUNCH)
for (const w of [821, 1024, 1536, 2560]) {
  const { ctx, page } = await open(browser, { viewport: { width: w, height: 760 } })
  await page.mouse.move(2, 2); await page.waitForTimeout(250)
  res[w] = { after: await shoot(page, w, 'after') }
  const tag = await page.addStyleTag({ content: BEFORE }); await page.waitForTimeout(250)
  res[w].before = await shoot(page, w, 'before')
  await tag.evaluate(n => n.remove()); await page.waitForTimeout(150)
  if (w === 1536) {
    // the input window open: the list makes its room (D1787) and keeps its line
    await page.locator('#inNew').click(); await page.waitForSelector('[data-testid="win-inputedit"]'); await page.waitForTimeout(400)
    res[w].window = await measure(page)
    await page.screenshot({ path: join(OUT, `d1843-${w}-window.png`) })
    await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    // a row hovered: its own highlight inside the line
    await page.locator('#inBody tr').nth(1).hover(); await page.waitForTimeout(250)
    await page.screenshot({ path: join(OUT, `d1843-${w}-hover-end.png`), clip: { x: res[w].after.table.right - 260, y: (await listBox(page)).y, width: 300, height: (await listBox(page)).height } })
  }
  await ctx.close()
}
{ // the phone: cards, not this table — unchanged
  const { ctx, page } = await open(browser, { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 })
  res.phone = { table: await page.locator('#intbl').count(), nodocCards: await page.locator('.icard-nodoc').count() }
  await page.screenshot({ path: join(OUT, 'd1843-phone.png') })
  await ctx.close()
}
await browser.close()
res.errors = errors
writeFileSync(join(OUT, 'd1843-look.json'), JSON.stringify(res, null, 1))
console.log(JSON.stringify({ e: errors.length, w821: res[821], w1536win: res[1536].window, phone: res.phone }))
