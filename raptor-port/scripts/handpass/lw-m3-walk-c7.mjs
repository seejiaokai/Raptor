// Scenario 27: a member's Move onto a closed day. usage: node lw-m3-walk-c7.mjs <desk|phone> <chromium|webkit>
import * as L from './lw-m3-walk-c-lib.mjs'
const size = process.argv[2] || 'desk', engine = process.argv[3] || 'chromium'
const P = `s27-${size}-${engine}-`
console.log('lw-m3-walk-c7 v1', size, engine)
L.clearPrefix(P)
const w = await L.newCtx(size, engine)
await L.signIn(w, 'member', '2026-03-15')
const { page } = w
const say = async () => page.evaluate(() => ({
  banner: (document.querySelector('[data-testid="move-banner"]') || {}).innerText || null,
  toasts: [...document.querySelectorAll('.toast, [role="status"], [role="alert"], .note.warn')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean),
  picker: !!document.querySelector('[data-testid="bid-picker"]'),
}))
await L.gotoMonth(w, 'MAR')
// a bid on 20 Mar (open: today is 15 Mar, the war's demo open dates run to 31 Mar)
await L.press(w, L.T(L.cellId('bane', '2026-03-20')), w.phone ? { quick: P + '01-open-cell-tap' } : {}); await page.waitForTimeout(500)
await L.shot(w, P + '02-bid-window')
await L.press(w, L.T('bid-LL')); await page.waitForTimeout(600)
if (await L.vis(page, L.T('bid-picker'))) await L.press(w, L.T('bid-LL')), await page.waitForTimeout(600)
console.log('cell after bid', JSON.stringify(await L.cellInfo(page, 'bane', '2026-03-20')))
await L.shot(w, P + '03-bid-placed')
// open it, Move
await L.press(w, L.T(L.cellId('bane', '2026-03-20'))); await page.waitForTimeout(500)
await L.shot(w, P + '04-own-bid-window')
await L.press(w, L.T('decide-shift'), w.phone ? { quick: P + '05-move-tap' } : {}); await page.waitForTimeout(600)
console.log('after Move pressed', JSON.stringify(await say()))
await L.shot(w, P + '06-move-mode')
// to a closed day: April (closed for him — only dates up to 31 Mar are open)
await L.gotoMonthKeepMove?.(w)
await L.press(w, L.T('month-APR')); await page.waitForTimeout(1200)
console.log('after APR button', JSON.stringify(await say()))
await L.shot(w, P + '07-april-in-move-mode')
await L.press(w, L.T(L.cellId('bane', '2026-04-08')), w.phone ? { quick: P + '08-closed-day-tap' } : {}); await page.waitForTimeout(700)
const s = await say(); console.log('after tap on closed 8 Apr', JSON.stringify(s))
await L.shot(w, P + '09-closed-day-tapped')
// a day outside the war's dates is a different reason: skip. Now an open day lands fine? tap 25 Mar to compare
await L.press(w, L.T('month-MAR')); await page.waitForTimeout(1200)
await L.press(w, L.T(L.cellId('bane', '2026-03-25')), w.phone ? { quick: P + '10-open-day-tap' } : {}); await page.waitForTimeout(700)
console.log('after tap on open 25 Mar', JSON.stringify(await say()))
await L.shot(w, P + '11-open-day-tapped')
console.log('errors', JSON.stringify(w.errs))
await L.closeBrowser()
