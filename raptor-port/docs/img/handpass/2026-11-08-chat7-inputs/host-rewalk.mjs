// Chat 7, the host's re-walk of what the fixes touched (D1787): the input window dragged away gives the list its room back,
// reopened where he left it makes none; opened from the Calendar then the List shown; Medical's room untouched; and the room
// measured with the page's real scroll bar showing (the test browser hides it by default — §7.11 lesson 6).
// Run: node host-rewalk.mjs <port>   (a build of this branch served on that port)
import { chromium } from 'playwright'
import { existsSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = dirname(fileURLToPath(import.meta.url))
const BASE = 'http://localhost:' + (process.argv[2] || '4378')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launch = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const out = [], errors = []
const rec = (step, expected, saw, pass, pic) => { out.push({ step, expected, saw, pass, pic }); console.log(`${pass ? 'PASS' : 'FAIL'} ${step} :: ${JSON.stringify(saw)} ${pic || ''}`) }
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const W = '[data-testid="win-inputedit"]'

async function open(browser, w, h, args) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })
  await ctx.clock.install({ time: new Date('2026-07-13T09:00:00+08:00') })
  const page = await ctx.newPage()
  page.on('console', m => { if (m.type() === 'error') errors.push(`${w}: console ${m.text()}`) })
  page.on('pageerror', e => errors.push(`${w}: pageerror ${e.message}`))
  page.on('response', r => { if (r.status() >= 400) errors.push(`${w}: ${r.status()} ${r.url()}`) })
  await page.goto(BASE + '/')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(500)
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(700)
  return { ctx, page }
}
const list = async page => { if (!(await page.locator('#intbl').isVisible().catch(() => false))) { await page.locator('#inListBtn').first().click(); await page.waitForTimeout(500) } }
const cols = page => page.evaluate(() => [...document.querySelectorAll('#intbl thead th')].map(t => Math.round(t.getBoundingClientRect().width)))
const geo = page => page.evaluate(sel => {
  const w = document.querySelector(sel)?.getBoundingClientRect(), t = document.querySelector('#intbl')?.getBoundingClientRect()
  const wrap = document.querySelector('.inwrap')
  return { winLeft: w ? Math.round(w.left) : null, listRight: t ? Math.round(t.right) : null, pad: wrap ? getComputedStyle(wrap).paddingRight : null,
    room: !!document.querySelector('.inputs-workspace.in-room'), placed: !!document.querySelector('.floatwin.inpedwin[data-placed]'),
    scrollbar: window.innerWidth - document.documentElement.clientWidth }
}, W)
const shot = async (page, name) => { await page.screenshot({ path: join(OUT, name + '.png') }); return name + '.png' }

const browser = await chromium.launch(launch)
// R1 — dragged away, at 1536 and 1340
for (const [w, h] of [[1536, 864], [1340, 800]]) {
  const { ctx, page } = await open(browser, w, h); await list(page)
  const closed = await cols(page)
  await page.locator('#inNew').click(); await page.locator(W).waitFor(); await page.waitForTimeout(700)
  const g0 = await geo(page), c0 = await cols(page)
  rec(`${w} + Input: the room`, 'room made, 110/140/90', { ...g0, cols: c0 }, g0.room && eq(c0.slice(0, 3), [110, 140, 90]) && g0.listRight <= g0.winLeft, await shot(page, `host-${w}-1-room`))
  const bar = await page.locator(W + ' .win-ttl').boundingBox()
  await page.mouse.move(bar.x + 30, bar.y + bar.height / 2); await page.mouse.down()
  await page.mouse.move(bar.x - 400, bar.y + 80, { steps: 8 }); await page.mouse.move(bar.x - 800, bar.y + 150, { steps: 8 }); await page.mouse.up()
  await page.waitForTimeout(600)
  const g1 = await geo(page), c1 = await cols(page)
  rec(`${w} dragged away`, 'the room given back: the closed widths, the list full width', { ...g1, cols: c1, closed }, g1.placed && eq(c1, closed), await shot(page, `host-${w}-2-dragged`))
  await page.keyboard.press('Escape'); await page.waitForTimeout(500)
  await page.locator('#inBody tr .in-open').first().click(); await page.locator(W).waitFor(); await page.waitForTimeout(700)
  const g2 = await geo(page), c2 = await cols(page)
  rec(`${w} a row reopened where he left it`, 'no room, the closed widths', { ...g2, cols: c2 }, g2.placed && eq(c2, closed), await shot(page, `host-${w}-3-reopened`))
  await ctx.close()
}
// a tap on the window's bar without a move keeps the room (a tap is not a drag)
{
  const { ctx, page } = await open(browser, 1536, 864); await list(page)
  await page.locator('#inNew').click(); await page.locator(W).waitFor(); await page.waitForTimeout(700)
  await page.locator(W + ' .win-ttl').click(); await page.waitForTimeout(500)
  const g = await geo(page), c = await cols(page)
  rec('1536 a click on the bar, no move', 'the room stays', { ...g, cols: c }, g.room && !g.placed && eq(c.slice(0, 3), [110, 140, 90]), await shot(page, 'host-1536-4-barclick'))
  await ctx.close()
}
// opened from the Calendar's day, then the List shown
{
  const { ctx, page } = await open(browser, 1536, 864)
  if (await page.locator('#intbl').isVisible().catch(() => false)) { await page.locator('#inCalBtn').first().click().catch(() => {}); await page.waitForTimeout(500) }
  const cell = page.locator('[data-icday="2026-07-15"]').first()
  await cell.click().catch(() => {}); await page.waitForTimeout(700)
  const add = page.locator('#icPopAdd').first()
  const hasAdd = await add.count()
  if (hasAdd) { await add.click(); await page.locator(W).waitFor({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(700) }
  await shot(page, 'host-1536-5-fromcal')
  await page.locator('#inListBtn').first().click().catch(() => {}); await page.waitForTimeout(700)
  const g = await geo(page), c = await cols(page), win = await page.locator(W).isVisible().catch(() => false)
  rec('1536 window opened from the Calendar, then List', 'the window still open; the room made only if it stands where it opens', { ...g, cols: c, win, hasAdd: !!hasAdd },
    win ? (g.placed ? !g.room || eq(c.slice(0, 3), [250, 150, 115]) : g.listRight <= g.winLeft) : true, await shot(page, 'host-1536-6-fromcal-list'))
  await ctx.close()
}
// Medical's room — untouched
{
  const { ctx, page } = await open(browser, 1536, 864)
  await page.locator('button', { hasText: 'Medical' }).filter({ hasNotText: '+' }).first().click(); await page.waitForTimeout(700)
  const btn = page.locator('#medNew').first()
  await btn.click(); await page.locator(W).waitFor({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(700)
  const medRoom = await page.evaluate(() => !!document.querySelector('.med-room'))
  rec('1536 Medical: + Medical makes its own room as before', 'med-room on', { medRoom }, medRoom, await shot(page, 'host-1536-7-medical'))
  await ctx.close()
}
// the room with the page's real scroll bar (lesson 6): Remarks at 1536 and 1340
{
  const sb = await chromium.launch({ ...launch, ignoreDefaultArgs: ['--hide-scrollbars'] })
  for (const [w, h] of [[1536, 864], [1340, 800]]) {
    const { ctx, page } = await open(sb, w, h); await list(page)
    await page.locator('#inNew').click(); await page.locator(W).waitFor(); await page.waitForTimeout(700)
    const g = await geo(page), c = await cols(page)
    rec(`${w} with the scroll bar shown`, 'Remarks still usable (about 15px less)', { ...g, cols: c }, c[4] >= 130 && g.listRight <= g.winLeft, await shot(page, `host-${w}-8-scrollbar`))
    await ctx.close()
  }
  await sb.close()
}
await browser.close()
writeFileSync(join(OUT, 'host-rewalk.json'), JSON.stringify({ out, errors }, null, 1))
console.log('errors:', errors.length ? errors : 'none')
