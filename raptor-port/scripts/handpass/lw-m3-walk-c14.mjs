// Pictures for the 2 Jan heading fault: a mark drawn where the finger lands (on the 2 Jan heading), then what opens.
// usage: node lw-m3-walk-c14.mjs <chromium|webkit>
import * as L from './lw-m3-walk-c-lib.mjs'
const engine = process.argv[2] || 'chromium'
const P = `fault-jan2-phone-${engine}-`
console.log('lw-m3-walk-c14 v1', engine)
L.clearPrefix(P)
const w = await L.newCtx('phone', engine)
await L.signIn(w, 'admin')
const { page } = w
await L.gotoMonth(w, 'JAN'); await page.waitForTimeout(700)
const b = await page.evaluate(() => { const r = document.querySelector('[data-testid="head-2026-01-02"]').getBoundingClientRect(); return [r.x, r.y, r.width, r.height] })
const x = Math.round(b[0] + 5), y = 252
await page.evaluate(([x, y, b]) => {
  const m = document.createElement('div'); m.id = '__mark'
  m.style.cssText = `position:fixed;left:${x - 4}px;top:${y - 4}px;width:8px;height:8px;border-radius:50%;background:#ff2d55;z-index:99999;pointer-events:none`
  const f = document.createElement('div'); f.id = '__frame'
  f.style.cssText = `position:fixed;left:${b[0]}px;top:${b[1]}px;width:${b[2]}px;height:${b[3]}px;outline:1px solid #ffd60a;z-index:99998;pointer-events:none`
  document.body.append(f, m)
}, [x, y, b])
await L.shot(w, P + '01-where-the-finger-lands-yellow-box-is-the-2-Jan-heading')
await page.evaluate(() => { document.getElementById('__mark').remove(); document.getElementById('__frame').remove() })
if (w.cdp) await L.finger(w, x, y, { quick: P + '02-100ms-after-lift' }); else { await page.touchscreen.tap(x, y); await page.waitForTimeout(90); await L.shot(w, P + '02-100ms-after-lift') }
await page.waitForTimeout(500)
await L.shot(w, P + '03-settled')
console.log('tap at x=' + x + ' on heading box x=' + b[0].toFixed(1) + '..' + (b[0] + b[2]).toFixed(1) + ' opened', await page.locator(L.T('lwday-body')).first().getAttribute('data-iso').catch(() => null))
await L.closeBrowser()
