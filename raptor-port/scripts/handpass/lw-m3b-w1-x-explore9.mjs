// exploration only: all-day Training -> Edit Schedule Personal Inputs -> Reject -> → Unavail
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const w = await M.start('desk')
const P = w.page
const D = '2026-07-15'
await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(1000)
if (!(await L.vis(P, T('in-new')))) { await L.press(w, '#inListBtn'); await P.waitForTimeout(700) }
await L.press(w, T('in-new')); await P.waitForSelector(T('win-inputedit'), { timeout: 5000 }); await P.waitForTimeout(600)
await P.locator('#inpEditPerson').selectOption({ label: 'Ranger' })
await P.locator('#inpEditType').selectOption('Training'); await P.waitForTimeout(500)
await P.locator('#inpEditRmk').fill('Sim refresher')
await L.press(w, `[data-testid="inpEdCal-day-${D}"]`); await P.waitForTimeout(400)
await P.locator('[data-testid="win-inputedit"] label:has-text("all day") input').check(); await P.waitForTimeout(300)
await L.press(w, '#inpEditSave'); await P.waitForTimeout(1200)
console.log('INPUTS Training:', JSON.stringify(await P.evaluate(() => (window.INPUTS || []).filter(r => r.type === 'Training' && JSON.stringify(r).includes('bane')).map(r => ({ allday: r.allday, s: r.s, e: r.e, acc: r.acc, date: r.date })))))
await P.evaluate(() => window.go('editsched')); await P.waitForTimeout(1500)
await L.press(w, '[data-pitog="2"]'); await P.waitForTimeout(600)
console.log('sec-inp:', JSON.stringify(await P.evaluate(() => { const d = document.querySelector('#eWeek section.day[data-day="2"] .sec-inp'); return { text: d.innerText.replace(/\s+/g, ' ').slice(0, 500), accb: [...d.querySelectorAll('.accb')].map(b => b.textContent.trim() + '|' + (b.dataset.act || b.dataset.acc || b.className)) } })))
await M.settled(w, 'x-explore-es2')
await P.locator('#eWeek section.day[data-day="2"] .sec-inp .accb').first().click(); await P.waitForTimeout(800)
console.log('after first accb:', JSON.stringify(await P.evaluate(() => { const d = document.querySelector('#eWeek section.day[data-day="2"]'); return { inp: d.querySelector('.sec-inp').innerText.replace(/\s+/g, ' ').slice(0, 400), accb: [...d.querySelectorAll('.sec-inp .accb')].map(b => b.textContent.trim()), unav: d.querySelector('.sec-unav').innerText.replace(/\s+/g, ' ').slice(0, 200) } })))
console.log('errs', w.errs)
await w.ctx.close(); await M.closeBrowser()
