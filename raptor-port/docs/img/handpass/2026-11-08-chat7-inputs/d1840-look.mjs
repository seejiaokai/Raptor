// Chat 7, the LOOK for his D1840 (8 Nov 26, "all as recommended" — the Type column narrowed to 124 from 821 to 1099 wide):
// the desktop Inputs list at 821, 900, 1024 and 1099 wide, AFTER (as built) and BEFORE (Type put back to its 160 by a style
// laid over the same build, for the picture only), and the phone's list, which draws cards and is unchanged. Measured at
// each width: the columns, every pill in the Type column (one line, inside its cell), every word in Remarks broken across
// lines or not, and every kind the type filter offers drawn as a pill in a Type cell (the list shows only the kinds the
// demo's fortnight holds). Served from the built bundle by the drawing check's own route (no server).
// Run (from raptor-port/, after a build): node docs/img/handpass/2026-11-08-chat7-inputs/d1840-look.mjs
import { chromium, LAUNCH, serveDist } from '../../../../scripts/drawcheck/lib.mjs'
import { writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = dirname(fileURLToPath(import.meta.url))
const DIST = resolve(OUT, '../../../../dist')
const ORIGIN = 'http://localhost:4291'
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
  if (!(await page.locator('#intbl, .inlist-cards, #inBody').first().isVisible().catch(() => false))) {
    await page.locator('#inListBtn').first().click(); await page.waitForTimeout(500)
  }
  return { ctx, page }
}

const measure = page => page.evaluate(() => {
  const cols = [...document.querySelectorAll('#intbl thead th')].map(t => Math.round(t.getBoundingClientRect().width))
  const pills = [...document.querySelectorAll('#inBody td:nth-child(4) .intag')].map(e => {
    const b = e.getBoundingClientRect(), td = e.closest('td'), c = td.getBoundingClientRect()
    return { text: e.textContent, lines: e.getClientRects().length, spill: Math.round(b.right - (c.right - parseFloat(getComputedStyle(td).paddingRight))) }
  })
  // a word of Remarks broken across two lines: its own range has more than one line box
  const broken = []
  for (const td of document.querySelectorAll('#inBody td:nth-child(5)')) {
    const walk = document.createTreeWalker(td, NodeFilter.SHOW_TEXT)
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      for (const m of n.textContent.matchAll(/\S+/g)) {
        const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length)
        const tops = new Set([...r.getClientRects()].map(x => Math.round(x.top)))
        if (tops.size > 1) broken.push(m[0])
      }
    }
  }
  const rows = document.querySelectorAll('#inBody tr').length
  return { cols, rows, pills: { n: pills.length, maxLines: Math.max(0, ...pills.map(p => p.lines)), maxSpill: Math.max(-999, ...pills.map(p => p.spill)) }, brokenWords: broken }
})
// every kind the type filter offers, drawn as the list draws it (Appointment with its hidden tail) inside a Type cell
const everyKind = page => page.evaluate(() => {
  const td = document.querySelector('#inBody td:nth-child(4)'); if (!td) return { error: 'no row' }
  const c = td.getBoundingClientRect(), right = c.right - parseFloat(getComputedStyle(td).paddingRight)
  const kinds = [...document.querySelectorAll('#inFType option')].map(o => o.value).filter(v => v && v !== 'all')
  const out = []
  for (const k of kinds) {
    for (const titled of [false, true]) {
      const holder = document.createElement('div')
      if (titled) { const b = document.createElement('b'); b.className = 'intitle'; b.textContent = 'T'; holder.append(b) }
      const s = document.createElement('span'); s.className = 'intag'
      if (k === 'Appointment') { s.append('Appoint'); const bl = document.createElement('span'); bl.className = 'bl'; bl.textContent = 'ment'; s.append(bl) } else s.textContent = k
      holder.append(s); td.append(holder)
      const b = s.getBoundingClientRect()
      out.push({ kind: k, titled, lines: new Set([...s.getClientRects()].map(x => Math.round(x.top))).size, spill: Math.round(b.right - right) })
      holder.remove()
    }
  }
  return { kinds: kinds.length, worst: out.filter(o => o.lines > 1 || o.spill > 0) }
})

const browser = await chromium.launch(LAUNCH)
for (const w of [821, 900, 1024, 1099]) {
  const { ctx, page } = await open(browser, { viewport: { width: w, height: 760 } })
  res[w] = { after: { ...(await measure(page)), everyKind: await everyKind(page) } }
  await page.screenshot({ path: join(OUT, `d1840-${w}-after.png`) })
  await page.addStyleTag({ content: '.intbl thead th:nth-child(4){width:160px !important}' }); await page.waitForTimeout(300)
  res[w].before = await measure(page)
  await page.screenshot({ path: join(OUT, `d1840-${w}-before.png`) })
  await ctx.close()
}
{
  const { ctx, page } = await open(browser, { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true })
  res.phone = { tableShown: await page.locator('#intbl').isVisible().catch(() => false) }
  await page.screenshot({ path: join(OUT, 'd1840-phone.png') })
  await ctx.close()
}
await browser.close()
res.errors = errors
writeFileSync(join(OUT, 'd1840-look.json'), JSON.stringify(res, null, 1))
console.log(JSON.stringify(res))
