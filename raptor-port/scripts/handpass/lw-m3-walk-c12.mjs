// D1281 pressed-state pictures for the day panel's controls on a phone: heading tap, the panel's closing cross, and a tap on the
// grid with the pointer left where it pressed. usage: node lw-m3-walk-c12.mjs <chromium|webkit>
import * as L from './lw-m3-walk-c-lib.mjs'
const engine = process.argv[2] || 'chromium'
const P = `d1281-phone-${engine}-`
console.log('lw-m3-walk-c12 v1', engine)
L.clearPrefix(P)
const w = await L.newCtx('phone', engine)
await L.signIn(w, 'admin')
const { page } = w
await L.gotoMonth(w, 'JUL'); await page.waitForTimeout(800)
await L.shot(w, P + '00-before')
await L.press(w, L.T('head-2026-07-15'), { quick: P + '01-heading-tap-100ms' }); await page.waitForTimeout(500)
await L.shot(w, P + '02-heading-tap-settled')
await L.press(w, L.T('lwday-next'), { quick: P + '03-next-100ms' }); await page.waitForTimeout(400)
await L.press(w, L.T('lwday-prev'), { quick: P + '04-prev-100ms' }); await page.waitForTimeout(400)
await L.press(w, L.T('win-lwday-x'), { quick: P + '05-close-100ms' }); await page.waitForTimeout(600)
await L.shot(w, P + '06-close-settled')
console.log('panel open after close:', await L.vis(page, L.T('lwday-body')))
console.log('errors', JSON.stringify(w.errs))
await L.closeBrowser()
