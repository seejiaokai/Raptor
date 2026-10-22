// The colleague's app ("Gryphon", his word), run ONLY locally from a saved copy with a stand-in database of made-up
// people; its unit name is replaced with "Sample" in the copy, and none of its own data is ever opened. The copy and its
// stand-in live in the chat's scratchpad and are NOT committed (they carry the colleague's code).
import { join } from 'node:path'
import { chromium, SP, OUT, errs } from './full-lib.mjs'
const FILE = 'file:///' + join(SP, 'colleague/index.html').replace(/\\/g, '/')
const browser = await chromium.launch()
async function open(w, h, touch) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: touch ? 3 : 1.25, hasTouch: touch, isMobile: touch })
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(String(e)))
  await p.clock.setFixedTime(new Date('2026-10-21T09:00:00+08:00'))
  await p.goto(FILE); await p.waitForTimeout(1200)
  const bad = await p.evaluate(() => /gryphon/i.test(document.body.innerText)); if (bad) throw new Error('unit name still on screen')
  return { ctx, p }
}
const shot = async (p, n) => { await p.waitForTimeout(300); await p.screenshot({ path: join(OUT, n + '.png') }); console.log('shot', n) }
let { ctx, p } = await open(1536, 900, false)
await p.click('[data-prof="viper"]').catch(() => console.log('no prof click')); await shot(p, 'th-desk-person'); await p.keyboard.press('Escape')
await p.evaluate(() => document.querySelector('.ov')?.click()); await p.waitForTimeout(300)
await p.click('[data-act="locks"]'); await shot(p, 'th-desk-locks')
await p.evaluate(() => document.querySelector('.ov')?.click()); await p.waitForTimeout(300)
await p.click('[data-tab="hol"]'); await shot(p, 'th-desk-holidays')
await p.click('[data-tab="bal"]'); await shot(p, 'th-desk-balances')
await ctx.close()
;({ ctx, p } = await open(390, 844, true))
await p.tap('[data-prof="viper"]').catch(() => console.log('no prof tap')); await shot(p, 'th-phone-person')
await ctx.close(); await browser.close(); console.log('errors:', errs)
