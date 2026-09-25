/* b3-04c — probe (walker B3): on a phone board with History on, a tap on a detail edited 13 times — does the bubble
   rise, and for how long? Mouse-driven phone (no touch) vs a touch phone, read at 0 / 150 / 600 / 2000 ms. Read-only
   apart from the 13 edits made through the box itself. Usage: node scripts/handpass/am/b3-04c-phone-probe.mjs */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/b3'
const L = await import('./w2-lib.mjs')
const { openHi, editWeek, board, login, STATE, PHONE, BASE } = L
import { existsSync } from 'node:fs'
import { chromium } from '@playwright/test'
async function openTouch() {
  const CH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
  const browser = await chromium.launch({ headless: true, ...(existsSync(CH) ? { executablePath: CH } : {}) })
  const ctx = await browser.newContext({ ...PHONE, deviceScaleFactor: 3, isMobile: true, hasTouch: true, storageState: STATE })
  const page = await ctx.newPage(); const errors = []
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  await page.goto(BASE + '/'); await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' }); await login(page, 'a')
  return { browser, page, errors }
}
const DI = 4
for (const mode of ['mouse', 'touch']) {
  const { browser, page, errors } = mode === 'touch' ? await openTouch() : await openHi({ ...PHONE, state: STATE, dpr: 3 })
  await editWeek(page); await board(page, DI)
  const key = await page.evaluate(i => { const e = [...document.querySelectorAll(`#schedBoard [data-bfld^="ap:${i}."][data-bfld$=".str"]`)].find(x => x.offsetWidth); return e ? e.dataset.bfld : null }, DI)
  const sel = `#schedBoard [data-bfld="${key}"]:visible`
  for (let k = 1; k <= 13; k++) { const el = page.locator(sel).first(); await el.click({ force: true }); await el.fill(''); await el.type(`07${String(k).padStart(2, '0')}`, { delay: 5 }); await el.evaluate(e => e.blur()); await page.waitForTimeout(100) }
  const hb = page.locator('#schedBoard #sbHist:visible').first()
  const histBtn = await hb.count()
  if (histBtn) { await hb.click(); await page.waitForTimeout(400) }
  const info = await page.evaluate(() => ({ phone: matchMedia('(max-width:820px)').matches, hist: !!document.querySelector('#sbHist.on'), elog: typeof window.elogFor }))
  const el = page.locator(sel).first(); await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300)
  const b = await el.boundingBox()
  await page.evaluate(() => { window.__hb = []; const t0 = performance.now(); new MutationObserver(() => { const h = document.querySelector('.histbub'); window.__hb.push(Math.round(performance.now() - t0) + ':' + (h ? 'up' : 'none')) }).observe(document.body, { childList: true }) })
  if (mode === 'touch') await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
  else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  const reads = []
  for (const t of [0, 150, 600, 2000]) { if (t) await page.waitForTimeout(t - (reads.length ? [0, 150, 600, 2000][reads.length - 1] : 0)); reads.push(t + 'ms:' + await page.evaluate(() => { const h = document.querySelector('.histbub'); return h ? 'UP rows=' + h.querySelectorAll('li').length + ' vis=' + getComputedStyle(h).visibility : 'none' })) }
  const trace = await page.evaluate(() => window.__hb)
  await page.screenshot({ path: `${process.env.HP_SHOTS}/p-H0-probe-${mode}.png` })
  console.log(mode, JSON.stringify({ histBtn, info, reads, trace, errors }))
  await browser.close()
}
