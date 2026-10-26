/* [UI-CONSISTENCY-LOOK] (D1124) — every page's top rows pictured and measured, at his PC's size (1536 × 864) and his
   iPhone's (402 × 874, touch), so rows that should match can be compared: for each page, a picture of its top, and the
   visible controls in that band — words, place, size, font size and weight.
   Run: HP_URL=http://localhost:<port> HP_SHOTS=<folder> node scripts/handpass/bsw-consistency.mjs → <folder>/consistency/ */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = SHOTS + '/consistency'; mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const out = {}
/* the controls in the band under the app's top bar: buttons, tabs, selects, inputs, and any month title */
const band = (page, h) => page.evaluate(h => {
  const top = (document.querySelector('.topbar')?.getBoundingClientRect().bottom) || 0
  const vis = e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && r.top >= top - 1 && r.top < top + h }
  const pick = [...document.querySelectorAll('button,a[role=button],[role=tab],select,input:not([type=hidden]),.ic-mon,.sc-month,h1,h2,.title,.lw-title,[class*=month]')].filter(vis)
  return pick.slice(0, 60).map(e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return { tag: e.tagName.toLowerCase(), id: e.id || '', cls: String(e.className || '').slice(0, 40), t: (e.getAttribute('aria-label') || e.textContent || e.value || e.placeholder || '').trim().replace(/\s+/g, ' ').slice(0, 30), x: Math.round(r.left), y: Math.round(r.top - top), w: Math.round(r.width), h: Math.round(r.height), fs: cs.fontSize, fw: cs.fontWeight, ff: cs.fontFamily.split(',')[0] } })
}, h)
async function shot(page, name, vp, h) {
  await sleep(350)
  const top = await page.evaluate(() => (document.querySelector('.topbar')?.getBoundingClientRect().top) || 0)
  await page.screenshot({ path: `${OUT}/${name}.png`, clip: { x: 0, y: Math.max(0, top), width: vp.width, height: Math.min(h, vp.height - top) } })
  out[name] = await band(page, h - 60)
}
const click = async (page, sel, touch) => { const l = page.locator(sel).first(); if (!(await l.count())) return false; if (touch) await l.tap(); else await l.click(); await sleep(450); return true }
for (const [vp, touch, tag] of [[{ width: 1536, height: 864 }, false, 'pc'], [{ width: 402, height: 874 }, true, 'phone']]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
  const page = await ctx.newPage(); await page.goto(BASE + '/'); await login(page, 'a')
  const H = touch ? 360 : 260
  for (const p of ['editsched', 'viewsched', 'quals', 'logic', 'leavewar', 'tracker', 'help', 'admin']) {
    try { await go(page, p); await sleep(600); await shot(page, `${tag}-${p}`, vp, H) } catch (e) { out[`${tag}-${p}`] = 'ERR ' + e.message.slice(0, 80) }
  }
  await go(page, 'inputs'); await sleep(600)
  await shot(page, `${tag}-inputs-calendar`, vp, H)
  if (await click(page, '#inListBtn', touch)) await shot(page, `${tag}-inputs-list`, vp, H)
  await click(page, '#inCalBtn', touch)
  if (await click(page, '#inSansMode', touch)) await shot(page, `${tag}-sans`, vp, H)
  if (await click(page, '#inMedBtn', touch)) await shot(page, `${tag}-medical`, vp, H)
  /* the Scheduler Board, opened from Edit Schedule's Monday */
  try { await go(page, 'editsched'); await page.locator('#eWeek [data-sbday="0"]:visible').first().click(); await page.waitForSelector('#schedBoard'); await sleep(600)
    await page.screenshot({ path: `${OUT}/${tag}-board.png`, clip: { x: 0, y: 0, width: vp.width, height: H } }); out[`${tag}-board`] = await band(page, H) } catch (e) { out[`${tag}-board`] = 'ERR ' + e.message.slice(0, 80) }
  await ctx.close()
}
writeFileSync(`${OUT}/consistency.json`, JSON.stringify(out, null, 1))
console.log('pictures:', Object.keys(out).length)
await browser.close()
