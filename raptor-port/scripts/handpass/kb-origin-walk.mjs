// His keyboard readout (29 Oct 26): windows placed by hand under a button or a bar now take their place in the screen's
// own measure (ui/kbscroll.ts fixedOrigin). A PC browser cannot slide the page as his iPhone's keys do, so this walk
// proves the other half: with no keys up, every one of them stands exactly where it stood before the change.
// Run from raptor-port:  node scripts/handpass/kb-origin-walk.mjs <old-dist> <new-dist> <out-dir>
import { chromium, serveDist } from '../drawcheck/lib.mjs'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
const [, , OLD, NEW, OUT = 'docs/img/handpass/2026-10-29-lw-m5b/look/kb'] = process.argv
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ORIGIN = 'http://localhost:4197'
async function measure(dist, kind) {
  const phone = kind === 'P'
  const ctx = await b.newContext(phone ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true, timezoneId: 'Asia/Singapore' }
    : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25, timezoneId: 'Asia/Singapore' })
  await serveDist(ctx, ORIGIN, dist)
  const p = await ctx.newPage()
  const errs = []; p.on('pageerror', e => errs.push(e.message))
  await p.clock.setFixedTime(new Date('2026-01-08T09:00:00+08:00'))
  await p.goto(ORIGIN + '/')
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { timeout: 20000 })
  const press = async sel => { const l = p.locator(sel).first(); if (phone) await l.tap(); else await l.click(); await p.waitForTimeout(450) }
  const box = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] }, sel)
  const out = {}
  // the bell's list
  await press('.bellbtn'); out.bell = await box('.bellpop, [data-testid="bell-pop"], .bell-list'); await p.keyboard.press('Escape'); await p.waitForTimeout(250)
  // the Tracker: Flex settings, Legend, File menu
  await p.evaluate(() => window.go('tracker')); await p.waitForTimeout(1500)
  await press('#flexBtn'); out.flex = await box('[data-testid="trk-flex"]')
  await p.screenshot({ path: join(OUT, `${kind}-${dist === NEW ? 'new' : 'old'}-flex.png`) })
  await p.keyboard.press('Escape'); await p.waitForTimeout(250)
  if (await p.locator('#legendBtn, [data-testid="trk-legend-open"]').count()) { await press('#legendBtn, [data-testid="trk-legend-open"]'); out.legend = await box('.tlegwin, [data-testid="trk-legend"]'); await p.keyboard.press('Escape'); await p.waitForTimeout(250) }
  out.errors = errs
  await ctx.close()
  return out
}
const res = {}
let fails = 0
for (const kind of ['P', 'D']) {
  const o = await measure(OLD, kind), n = await measure(NEW, kind)
  res[kind] = { old: o, new: n }
  for (const k of Object.keys(n)) {
    if (k === 'errors') continue
    const same = JSON.stringify(o[k]) === JSON.stringify(n[k])
    if (!same || !n[k]) fails++
    console.log(`${same && n[k] ? 'PASS' : 'FAIL'} ${kind} ${k}: before ${JSON.stringify(o[k])} after ${JSON.stringify(n[k])}`)
  }
  console.log(`${n.errors.length ? 'FAIL' : 'PASS'} ${kind} no page errors ${n.errors.join(' | ')}`); if (n.errors.length) fails++
}
await b.close()
writeFileSync(join(OUT, 'results.json'), JSON.stringify(res, null, 1))
console.log(fails ? 'SOME FAILED' : 'ALL PASS')
