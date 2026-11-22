// The night of 22–23 Nov 26, job 2 — the drawing check (D1494) of what was built against the approved drawings
// (docs/mock/2026-11-22-msq-b1-screens/img): the board's number (b1-2), the Tracker after a pick (f2a read only, f2c the
// member view, f2d the pick's question) and a window open at a pick (f7a the Leave War's, f7b the Input window). Each is
// reached for real on the built app, at his iPhone's size (402, WebKit) and the desktop's (1536, Chromium), as the drawing
// scripts drew them (redraw-b1.mjs b2, draw-f.mjs f2 and f7); a picture of each and the parts' places, sizes and words.
// Serve the build first:  npx vite preview --port 4477 --strictPort   then, from raptor-port/:
//   MQ_URL=http://localhost:4477/ MQ_OUT=<a folder outside the checkout> node scripts/handpass/n149/measure-job2.mjs
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'

const URL_ = process.env.MQ_URL || 'http://localhost:4477/'
const OUT = process.env.MQ_OUT || 'n149-job2-out'
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launch = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const SIZES = {
  d: { engine: chromium, opts: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 } },
  p: { engine: webkit, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
}
const errs = [], facts = {}
const browsers = {}
async function session(sz, user, pass) {
  const S = SIZES[sz]
  if (!browsers[sz]) browsers[sz] = await S.engine.launch(sz === 'd' ? launch : {})
  const ctx = await browsers[sz].newContext(S.opts)
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`[${sz}] PAGEERROR ${e}`))
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${sz}] CONSOLE ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`[${sz}] ${r.status()} ${r.url()}`) })
  await page.goto(URL_); await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(800)
  await page.addStyleTag({ content: '#toastEl { display: none !important; }' })
  return { ctx, page }
}
async function pick(page, num) {
  await page.locator('#sqnMenuBtn:visible').first().click(); await page.waitForTimeout(250)
  await page.locator('#sqnMenu .sqm-row', { hasText: num }).first().click(); await page.waitForTimeout(500)
}
async function toTracker(page) {
  await page.evaluate(() => window.go('tracker'))
  await page.waitForSelector('#page-tracker #board', { state: 'attached', timeout: 30000 }); await page.waitForTimeout(1500)
}
async function shot(page, file) {
  await page.mouse.move(1, 1).catch(() => {})
  await page.waitForTimeout(200)
  await page.screenshot({ path: `${OUT}/${file}` })
}
const rects = (page, sels) => page.evaluate(sels => Object.fromEntries(sels.map(s => {
  const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 0) || document.querySelector(s); if (!e) return [s, null]
  const b = e.getBoundingClientRect(), cs = getComputedStyle(e)
  return [s, { x: +b.left.toFixed(1), y: +b.top.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1), font: cs.fontSize, text: (e.textContent || '').trim().slice(0, 120) }]
})), sels)
const BAND = ['.topbar', '[data-testid="trk-cover-band"]', '[data-testid="trk-cover-band"] b', '[data-testid="trk-cover-band"] .sv-rest', '#page-tracker .tr-root']

for (const sz of ['d', 'p']) {
  // b1-2 — 142's own board, Monday; then 149 picked
  { const { ctx, page } = await session(sz, 'ad', 'a')
    await page.evaluate(() => window.go('editsched')); await page.waitForSelector('#page-editsched.on #eWeek .day'); await page.waitForTimeout(800)
    await page.evaluate(() => document.querySelector('#eWeek .day:not(.peek) [data-sbday="0"]').click())
    await page.waitForSelector('#schedBoard:not([hidden]) .sb-sqn'); await page.waitForTimeout(1000)
    facts[`b1-2-${sz}`] = await rects(page, ['#schedBoard .sb-top', '#schedBoard .sb-title', '#sbDate', '#schedBoard .sb-today', '#schedBoard .sb-sqn', '#sbDays', '#sbCal'])
    facts[`b1-2-${sz}`].cut = await page.evaluate(() => { const t = document.querySelector('#schedBoard .sb-title'); const b = t.querySelector('.sb-sqn').getBoundingClientRect(); return b.right > t.getBoundingClientRect().right + 0.5 })
    await page.screenshot({ path: `${OUT}/b1-2-${sz}.png`, clip: { x: 0, y: 0, width: sz === 'd' ? 1536 : 402, height: Math.round(facts[`b1-2-${sz}`]['#schedBoard .sb-top'].h) + 8 } })
    await pick(page, '149')
    facts[`b1-2-${sz}`].after149 = await page.textContent('#schedBoard .sb-sqn')
    await ctx.close() }
  // f2a — Saber opened the Tracker on 149, then picked 142
  { const { ctx, page } = await session(sz, 'ad', 'a')
    await pick(page, '149'); await toTracker(page); await pick(page, '142')
    facts[`f2a-${sz}`] = await rects(page, BAND)
    facts[`f2a-${sz}`].veil = await page.evaluate(() => { const h = document.querySelector('.trk-host'); return { inert: h.inert, cls: h.className, veil: getComputedStyle(h, '::after').backgroundColor } })
    await shot(page, `f2a-${sz}.png`)
    await ctx.close() }
  // f2c — the member view (desktop: the badge at the bar's right)
  if (sz === 'd') { const { ctx, page } = await session(sz, 'ad', 'a')
    await pick(page, '149'); await toTracker(page)
    await page.locator('#roleBadge').click(); await page.waitForTimeout(600)
    facts[`f2c-${sz}`] = await rects(page, BAND)
    facts[`f2c-${sz}`].hidden = await page.evaluate(() => getComputedStyle(document.querySelector('.trk-host')).display)
    await shot(page, `f2c-${sz}.png`)
    await ctx.close() }
  // f2d — an unsaved chart edit, then a pick, on the Tracker page; and from View-only Sched
  { const { ctx, page } = await session(sz, 'ad', 'a')
    await toTracker(page)
    const t = sel => page.locator(sel + ':visible').first().click()
    await t('#sylMenuBtn'); await t('#arrangeBtn')
    const add = page.locator('#arrTools button', { hasText: '+ Test' }).first()
    if (!(await add.isVisible())) await page.locator('#page-tracker button', { hasText: 'Tools ▾' }).first().click()
    await add.click(); await page.waitForSelector('#dlgInput:visible')
    await page.evaluate(() => { const i = [...document.querySelectorAll('#dlgInput')].find(x => x.getBoundingClientRect().width > 0); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, 'T-NEW'); i.dispatchEvent(new Event('input', { bubbles: true })) })
    await t('#dlgOk'); await page.waitForTimeout(400); await t('#sylMenuBtn'); await t('#arrangeBtn'); await page.waitForTimeout(400)
    await pick(page, '149')
    facts[`f2d-${sz}`] = await rects(page, ['#dlgModal', '#dlgMsg', '#dlgCancel', '#dlgAlt', '#dlgOk'])
    facts[`f2d-${sz}`].btns = await page.$$eval('#dlgModal button', bs => bs.filter(b => b.getBoundingClientRect().width > 0).map(b => b.textContent.trim()))
    await shot(page, `f2d-${sz}.png`)
    await page.click('#dlgCancel'); await page.waitForTimeout(300)
    await page.evaluate(() => window.go('viewsched')); await page.waitForTimeout(600)
    await pick(page, '149')
    facts[`f2d-away-${sz}`] = await rects(page, ['#dlgModal', '#dlgMsg'])
    facts[`f2d-away-${sz}`].page = await page.evaluate(() => window.CURPAGE)
    await shot(page, `f2d-away-${sz}.png`)
    await ctx.close() }
  // f7a — Saber on 142's Leave War, Ranger's Wed 25 Nov opened, then 149 picked
  { const { ctx, page } = await session(sz, 'ad', 'a')
    await page.evaluate(() => window.go('leavewar'))
    await page.waitForSelector('#page-leavewar [data-testid^="cell-"]', { state: 'attached', timeout: 30000 }); await page.waitForTimeout(1200)
    const id = await page.evaluate(() => { const c = [...document.querySelectorAll('#page-leavewar [data-testid^="cell-"]')].find(e => /-2026-11-25$/.test(e.getAttribute('data-testid')) && /^\s*Ranger/.test((e.closest('tr')?.querySelector('th, td')?.textContent) || '')); return c && c.getAttribute('data-testid') })
    if (id) {
      await page.locator(`[data-testid="${id}"]`).first().scrollIntoViewIfNeeded()
      await page.locator(`[data-testid="${id}"]`).first().click(); await page.waitForTimeout(700)
      await pick(page, '149')
      facts[`f7a-${sz}`] = await rects(page, ['[data-testid="move-band"]', '[data-testid="move-band"] b', '[data-testid="move-band"] .sv-rest', '[data-testid="move-band"] button', '.bidsheet-hd'])
      facts[`f7a-${sz}`].greyed = await page.evaluate(() => { const p = document.querySelector('[data-testid="move-band"]').closest('.bidsheet'); return [...(p || document).querySelectorAll('button, input, select, textarea')].filter(c => c.closest('[data-heldro]')).length })
      await shot(page, `f7a-${sz}.png`)
    } else errs.push(`[${sz}] f7a: Ranger's Wed 25 Nov not found`)
    await ctx.close() }
  // f7b — Saber on 142's Inputs, a new input from Wed 25 Nov's "+ Input", then 149 picked
  { const { ctx, page } = await session(sz, 'ad', 'a')
    await page.evaluate(() => window.go('inputs'))
    await page.waitForSelector('#inpCal [data-icday="2026-11-25"]', { timeout: 20000 }); await page.waitForTimeout(600)
    await page.locator('#inpCal [data-icday="2026-11-25"]').click({ position: { x: 8, y: 8 } }); await page.waitForTimeout(500)
    await page.locator('#icPopAdd').click(); await page.waitForSelector('[data-testid="win-inputedit"]'); await page.waitForTimeout(600)
    await pick(page, '149')
    facts[`f7b-${sz}`] = await rects(page, ['[data-testid="inped-moveband"]', '[data-testid="inped-moveband"] b', '[data-testid="inped-moveband"] .sv-rest', '[data-testid="inped-moveband"] button', '[data-testid="win-inputedit"]'])
    facts[`f7b-${sz}`].greyed = await page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] :is(button, input, select, textarea)')].filter(c => c.closest('[data-heldro]')).length)
    await shot(page, `f7b-${sz}.png`)
    await ctx.close() }
}
for (const b of Object.values(browsers)) await b.close()
writeFileSync(`${OUT}/facts.json`, JSON.stringify({ facts, errs }, null, 1))
console.log(JSON.stringify({ errs }, null, 1))
