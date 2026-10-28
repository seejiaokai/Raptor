// His find of 28 Oct 26: on the Leave War, FEB pressed in the month strip, February on screen, but MAR lit.
// For every month button, at his PC's desktop (1536 x 860 at 125%, Chromium) and his iPhone's 402 x 874 (WebKit): press it,
// let the grid settle, then read which button is lit and which month owns most of the day columns on screen (the dates
// read off the header cells actually visible between the frozen name column and the grid's right edge). Written as an
// assertion of the RIGHT behaviour: the lit button is the month that fills most of the view. Also after a sideways
// scroll by hand, and after a wait past the grid's idle time (2 s), when the window of drawn months can change.
// Run from raptor-port/ against the build served on PORT (default 4173): node scripts/handpass/lw-month-strip-check.mjs
import { webkit, chromium, devices } from '@playwright/test'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
const PORT = process.env.PORT || 4173
const OUT = path.resolve(process.env.OUT || 'docs/img/handpass/2026-10-28-lw-month-strip')
mkdirSync(OUT, { recursive: true })
let fails = 0
const ok = (name, pass, detail = '') => { if (!pass) fails++; console.log((pass ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : '')) }

async function open(browser, ctxOpts) {
  const ctx = await browser.newContext(ctxOpts); const P = await ctx.newPage()
  P.on('pageerror', e => ok('no page error', false, String(e).slice(0, 160)))
  await P.goto(`http://localhost:${PORT}/?fresh=1`); await P.waitForSelector('#luser')
  await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a'); await P.click('#loginForm button[type=submit]')
  await P.waitForSelector('#vWeek .day', { state: 'attached' })
  await P.evaluate(() => window.go('leavewar'))
  await P.waitForSelector('[data-testid="month-strip"] .mjump'); await P.waitForTimeout(1500)
  return P
}
// which month owns most of the visible day columns, and which button is lit
const read = P => P.evaluate(() => {
  const wrap = document.querySelector('.mx-wrap'), wr = wrap.getBoundingClientRect()
  // the frozen pair (the name and the +LVE column) is not the view: the readout reads from its right edge
  const left = Math.max(wr.left, ...[...wrap.querySelectorAll('.mxhead .who, .mxhead .bal')].map(e => e.getBoundingClientRect().right))
  const right = Math.min(wr.right, innerWidth)
  const px = {}, full = {}
  for (const th of wrap.querySelectorAll('.mxhead [data-testid^="head-"]')) {
    const r = th.getBoundingClientRect(); const d = th.getAttribute('data-testid').slice(5), m = d.slice(0, 7)
    full[m] = (full[m] || 0) + r.width
    const ov = Math.min(r.right, right) - Math.max(r.left, left); if (ov > 0) px[m] = (px[m] || 0) + ov
  }
  // a month only partly drawn has no full width to judge by; it is judged by how much of it is on screen
  const days = m => new Date(+m.slice(0, 4), +m.slice(5, 7), 0).getDate()
  const drawnWhole = m => wrap.querySelectorAll(`.mxhead [data-testid^="head-${m}-"]`).length === days(m)
  const order = Object.keys(px).sort()
  const half = order.find(m => drawnWhole(m) && px[m] * 2 >= full[m] - 1)
  const most = half || Object.entries(px).sort((a, b) => b[1] - a[1])[0]?.[0] || ''
  const lit = [...document.querySelectorAll('[data-testid="month-strip"] .mjump.on')].map(b => b.textContent.trim())
  return { most, lit, px }
})
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const label = ym => MON[+ym.slice(5, 7) - 1]

async function walk(browser, size, opts) {
  const P = await open(browser, opts)
  if (size === 'zoomed') {
    const box = await P.locator('.mx-wrap').boundingBox()
    await P.mouse.move(box.x + box.width / 2, box.y + 200)
    await P.keyboard.down('Control')
    for (let i = 0; i < 12; i++) { await P.mouse.wheel(0, 240); await P.waitForTimeout(120) }
    await P.keyboard.up('Control'); await P.waitForTimeout(1500)
    const dayW = await P.evaluate(() => document.querySelector('.mxhead [data-testid^="head-"]').getBoundingClientRect().width)
    ok('zoomed: the grid is zoomed out', dayW < 22, `a day ${dayW.toFixed(1)}px`)
  }
  const labels = await P.$$eval('[data-testid="month-strip"] .mjump', bs => bs.map(b => b.textContent.trim()))
  // first in order, then back again in reverse (a jump from a later month to an earlier one)
  for (const L of [...labels, ...[...labels].reverse()]) {
    await P.locator('[data-testid="month-strip"] .mjump', { hasText: L }).first().click()
    await P.waitForTimeout(900)
    const a = await read(P)
    ok(`${size}: pressed ${L} — lit ${a.lit.join('+') || 'none'}, most on screen ${label(a.most)}`, a.lit.length === 1 && a.lit[0].startsWith(L.slice(0, 3)))
    await P.waitForTimeout(2300)   // past the idle time, when the drawn window may grow
    const b = await read(P)
    ok(`${size}: …${L} after the idle wait — lit ${b.lit.join('+') || 'none'}, most on screen ${label(b.most)}`, b.lit.length === 1 && b.lit[0].startsWith(L.slice(0, 3)))
    if (L.startsWith('FEB')) await P.screenshot({ path: path.join(OUT, `${size}-feb.png`), clip: { x: 0, y: 0, width: Math.min(opts.viewport.width, 1300), height: 300 } })
  }
  // a sideways scroll by hand, a little at a time, reading after each
  await P.locator('[data-testid="month-strip"] .mjump', { hasText: 'JAN' }).first().click(); await P.waitForTimeout(1200)
  for (let i = 0; i < 12; i++) {
    await P.evaluate(() => { document.querySelector('.mx-wrap').scrollLeft += 400 }); await P.waitForTimeout(700)
    const c = await read(P)
    ok(`${size}: scrolled by hand step ${i + 1} — lit ${c.lit.join('+') || 'none'}, most on screen ${label(c.most)}`, c.lit.length === 1 && c.lit[0].startsWith(label(c.most)))
  }
  // the routes he may have taken: Approvals and back, the Manning fold, a narrower window, a far month first
  const press = async (L, why) => {
    await P.locator('[data-testid="month-strip"] .mjump', { hasText: L }).first().click(); await P.waitForTimeout(1200)
    const r = await read(P)
    ok(`${size}: ${why}, pressed ${L} — lit ${r.lit.join('+') || 'none'}, most on screen ${label(r.most)}`, r.lit.length === 1 && r.lit[0].startsWith(L))
    await P.waitForTimeout(2300)
    const r2 = await read(P)
    ok(`${size}: ${why}, ${L} after the idle wait — lit ${r2.lit.join('+') || 'none'}, most on screen ${label(r2.most)}`, r2.lit.length === 1 && r2.lit[0].startsWith(L))
  }
  // a press, then a jump from Approvals to a request's dates: the press is spent, the readout lights where the grid went
  if (await P.locator('[data-testid="lw-tab-approvals"]').count()) {
    await press('DEC', 'before a jump from Approvals')
    await P.click('[data-testid="lw-tab-approvals"]'); await P.waitForTimeout(1500)
    const link = P.locator('[data-testid^="appr-dates"], .ap-dates button, .ap-dates a').first()
    if (await link.count()) {
      await link.click(); await P.waitForTimeout(2000)
      const r = await read(P)
      ok(`${size}: DEC pressed, then a request's dates tapped on Approvals — lit ${r.lit.join('+') || 'none'}, should be ${label(r.most)}`, r.lit.length === 1 && r.lit[0].startsWith(label(r.most)))
      if (!(await P.locator('[data-testid="lw-tab-grid"]').evaluate(e => e.getAttribute('aria-selected') === 'true' || e.classList.contains('on')).catch(() => false))) await P.click('[data-testid="lw-tab-grid"]').catch(() => {})
      await P.waitForTimeout(800)
    } else ok(`${size}: a request's dates link on Approvals`, false, 'none found')
  }
  if (await P.locator('[data-testid="lw-tab-approvals"]').count()) {
    await press('DEC', 'before Approvals')
    await P.click('[data-testid="lw-tab-approvals"]'); await P.waitForTimeout(2500)
    await P.click('[data-testid="lw-tab-grid"]'); await P.waitForTimeout(2500)
    await press('FEB', 'back from Approvals')
  }
  const mt = P.locator('[data-testid="counts-toggle"]')
  if (await mt.count()) {
    await mt.click(); await P.waitForTimeout(800); await press('FEB', 'Manning folded')
    await mt.click(); await P.waitForTimeout(800); await press('MAR', 'Manning opened again'); await press('FEB', 'Manning opened again')
  }
  if (size !== 'phone') {
    await P.setViewportSize({ width: 1306, height: 1023 }); await P.waitForTimeout(1500)
    await press('FEB', 'his window, 1306 wide'); await press('JUL', 'his window, 1306 wide'); await press('FEB', 'his window, 1306 wide')
  }
  await P.context().close()
}
const cr = await chromium.launch()
await walk(cr, 'desk', { viewport: { width: 1536, height: 860 }, deviceScaleFactor: 1.25 })
// his wide screen (28 Oct 26): three to four months on screen at once
await walk(cr, 'wide', { viewport: { width: 2560, height: 1000 }, deviceScaleFactor: 1 })
// his 1536 with the grid zoomed out by Ctrl+scroll, as his pictures measure
await walk(cr, 'zoomed', { viewport: { width: 1536, height: 860 }, deviceScaleFactor: 1.25 })
await cr.close()
const wk = await webkit.launch()
await walk(wk, 'phone', { ...devices['iPhone 13'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 3 })
await wk.close()
console.log(fails ? `FAILS: ${fails}` : 'ALL PASS')
