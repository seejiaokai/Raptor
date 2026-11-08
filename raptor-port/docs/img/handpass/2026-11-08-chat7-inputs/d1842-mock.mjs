// Chat 7, the MOCK-UP for his D1842 (8 Nov 26 — "the left have a line but the right doesn't and also the word no document
// is very far to the right edge so I did try to scroll horizontally"): the desktop Inputs list at 821, 1024 and his PC's
// 1536 wide, today and three drawn options, each laid over the SAME build by a style tag (no source change):
//   0  today, as built;
//   A  the list closed by the line its rows already use (var(--edge)), drawn round the whole table, and "No document"
//      brought inside its column;
//   B  the list's rows on the app's panel surface (var(--panel)) instead of a frame, and "No document" brought inside;
//   C  only "No document" brought inside its column (the least change).
// Measured on each: where "No document" ends against its cell and the list's edge, where the Name starts against the
// list's left edge, whether the list's box scrolls sideways, and the colours the options use. Served from the built
// bundle by the drawing check's own route (no server). The phone draws cards, not this table, and is not drawn.
// Run (from raptor-port/, after a build): node docs/img/handpass/2026-11-08-chat7-inputs/d1842-mock.mjs
import { chromium, LAUNCH, serveDist } from '../../../../scripts/drawcheck/lib.mjs'
import { writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = dirname(fileURLToPath(import.meta.url))
const DIST = resolve(OUT, '../../../../dist')
const ORIGIN = 'http://localhost:4292'
const NODOC_IN = '.inact>span.in-nodoc{margin:0 !important}'
const OPTS = {
  0: '',
  A: '#intbl{box-shadow:0 0 0 1px var(--edge)}' + NODOC_IN,
  B: '#intbl tbody{background:var(--panel)}' + NODOC_IN,
  C: NODOC_IN,
}
const res = { widths: {} }
const errors = []

async function open(browser, w) {
  const ctx = await browser.newContext({ deviceScaleFactor: 2, viewport: { width: w, height: 760 } })
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
  if (!(await page.locator('#intbl').isVisible().catch(() => false))) {
    await page.locator('#inListBtn').first().click(); await page.waitForTimeout(500)
  }
  await page.waitForSelector('#inBody tr .in-open')
  return { ctx, page }
}

const measure = page => page.evaluate(() => {
  const t = document.querySelector('#intbl').getBoundingClientRect()
  const wrap = document.querySelector('.inwrap')
  const nodoc = [...document.querySelectorAll('#inBody .in-nodoc')].map(s => {
    const b = s.getBoundingClientRect(), td = s.closest('td'), c = td.getBoundingClientRect()
    return { spillPastPadding: Math.round(b.right - (c.right - parseFloat(getComputedStyle(td).paddingRight))), toListEdge: Math.round(t.right - b.right), text: Math.round(b.width) }
  })
  const name = document.querySelector('#inBody tr .in-open').getBoundingClientRect()
  const cs = getComputedStyle(document.documentElement)
  return {
    table: { left: Math.round(t.left), right: Math.round(t.right), width: Math.round(t.width) },
    viewport: innerWidth,
    nodoc: nodoc.length ? { n: nodoc.length, ...nodoc[0] } : { n: 0 },
    nameFromListEdge: Math.round(name.left - t.left),
    listScrollsSideways: wrap.scrollWidth > wrap.clientWidth,
    pageScrollsSideways: document.documentElement.scrollWidth > innerWidth,
    colours: { bg: cs.getPropertyValue('--bg').trim(), panel: cs.getPropertyValue('--panel').trim(), panel2: cs.getPropertyValue('--panel-2').trim(), edge: cs.getPropertyValue('--edge').trim() },
    wrapChildren: [...wrap.children].map(c => c.tagName + (c.id ? '#' + c.id : '')),
  }
})

const browser = await chromium.launch(LAUNCH)
for (const w of [821, 1024, 1536]) {
  const { ctx, page } = await open(browser, w)
  res.widths[w] = {}
  for (const [k, css] of Object.entries(OPTS)) {
    const tag = css ? await page.addStyleTag({ content: css }) : null
    await page.mouse.move(2, 2); await page.waitForTimeout(250)
    const m = await measure(page)
    res.widths[w][k] = m
    // the list from its headings down six rows, the page's margin each side kept in
    const box = await page.evaluate(() => {
      const t = document.querySelector('#intbl').getBoundingClientRect()
      const rows = [...document.querySelectorAll('#inBody tr')].slice(0, 7)
      const bottom = rows.length ? rows[rows.length - 1].getBoundingClientRect().bottom : t.bottom
      return { x: 0, y: Math.max(0, t.top - 12), width: innerWidth, height: Math.min(bottom + 12, innerHeight) - Math.max(0, t.top - 12) }
    })
    await page.screenshot({ path: join(OUT, `d1842-${w}-${k}.png`), clip: box })
    // the right end, close: its last two columns and the margin past the list
    const end = { x: Math.max(0, m.table.right - 260), y: box.y, width: Math.min(300, w - Math.max(0, m.table.right - 260)), height: box.height }
    await page.screenshot({ path: join(OUT, `d1842-${w}-${k}-end.png`), clip: end })
    if (tag) await tag.evaluate(n => n.remove())
  }
  await ctx.close()
}
await browser.close()
res.errors = errors
writeFileSync(join(OUT, 'd1842-mock.json'), JSON.stringify(res, null, 1))
console.log(JSON.stringify({ e: errors.length, w821: res.widths[821], w1536A: res.widths[1536].A }))
