// Scenario 26 (the landing half): a filing that lands says "This replaces ..." once. The refused half (a member filing leave for
// another man) cannot be reached through the app (D655) - recorded in the report as NOT RUN.
// usage: node lw-m3-walk-c9.mjs <desk|phone> <chromium|webkit>
import * as L from './lw-m3-walk-c-lib.mjs'
const size = process.argv[2] || 'desk', engine = process.argv[3] || 'chromium'
const P = `s26-${size}-${engine}-`
console.log('lw-m3-walk-c9 v1', size, engine)
L.clearPrefix(P)
const w = await L.newCtx(size, engine)
await L.signIn(w, 'member', '2026-03-15')
const { page } = w
await page.evaluate(() => { window.__toasts = []; const mo = new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) { const t = (n.innerText || '').replace(/\s+/g, ' ').trim(); if (t) window.__toasts.push(t) } }); mo.observe(document.body, { childList: true, subtree: true }) })
await L.gotoMonth(w, 'MAR')
const cell = L.T(L.cellId('bane', '2026-03-20'))
await L.press(w, cell); await page.waitForTimeout(500)
await L.press(w, L.T('bid-LL')); await page.waitForTimeout(700)
if (await L.vis(page, L.T('bid-picker'))) { await L.press(w, L.T('bid-LL')); await page.waitForTimeout(700) }
console.log('cell after bid', JSON.stringify(await L.cellInfo(page, 'bane', '2026-03-20')))
await L.shot(w, P + '01-pending-bid')
await page.evaluate(() => { window.__toasts.length = 0 })
// the Inputs page
await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(1000)
await L.press(w, '#inListBtn'); await page.waitForTimeout(700); await L.press(w, L.T('in-new')); await page.waitForTimeout(900)
await L.shot(w, P + '02-new-input')
await page.selectOption('#inpEditType', 'LL'); await page.waitForTimeout(400)
for (let k = 0; k < 14; k++) {
  const head = await page.evaluate(() => (document.querySelector('#inpEdCal')?.innerText || '').split(String.fromCharCode(10))[0])
  if (/March 2026/i.test(head)) break
  await page.evaluate(() => { const b = [...document.querySelectorAll('#inpEdCal button')].find(x => x.textContent.trim() === '‹'); b && b.click() }); await page.waitForTimeout(200)
}
console.log('editor calendar reads:', await page.evaluate(() => (document.querySelector('#inpEdCal')?.innerText || '').split(String.fromCharCode(10))[0]))
await L.press(w, '#inpEdCal [data-iso="2026-03-20"]'); await page.waitForTimeout(500)
await L.shot(w, P + '03-editor-dated')
await page.evaluate(() => { window.__toasts.length = 0 })
await L.press(w, '#inpEditSave'); await page.waitForTimeout(900)
await L.shot(w, P + '03b-the-ask')
await L.press(w, 'button:has-text("No document")'); await page.waitForTimeout(1500)
const said = await page.evaluate(() => window.__toasts.filter(t => /replace|Leave War|bid/i.test(t)))
console.log('words that appeared after Save:', JSON.stringify(said), '| count of "This replaces":', said.filter(t => /This replaces/.test(t)).length)
await L.shot(w, P + '04-after-save')
await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1200)
await L.gotoMonth(w, 'MAR')
console.log('war cell 20 Mar after the filing:', JSON.stringify(await L.cellInfo(page, 'bane', '2026-03-20')))
await L.shot(w, P + '05-war-after')
console.log('errors', JSON.stringify(w.errs))
await L.closeBrowser()
