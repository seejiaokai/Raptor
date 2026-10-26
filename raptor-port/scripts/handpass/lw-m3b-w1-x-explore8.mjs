// exploration only: a Training filed on the Inputs page, then Edit Schedule's "→ Unavail"
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const w = await M.start('desk')
const P = w.page
const D = '2026-07-15'   // Wednesday of the loaded week (day 2)
await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(1000)
if (!(await L.vis(P, T('in-new')))) { await L.press(w, '#inListBtn'); await P.waitForTimeout(700) }
await L.press(w, T('in-new')); await P.waitForSelector(T('win-inputedit'), { timeout: 5000 }); await P.waitForTimeout(600)
await P.locator('#inpEditPerson').selectOption({ label: 'Ranger' })
await P.locator('#inpEditType').selectOption('Training'); await P.waitForTimeout(500)
await P.locator('#inpEditRmk').fill('Sim refresher')
await L.press(w, `[data-testid="inpEdCal-day-${D}"]`); await P.waitForTimeout(400)
console.log('allday tick:', await P.evaluate(() => [...document.querySelectorAll('#inpEditPop input[type=checkbox], [data-testid="win-inputedit"] input[type=checkbox]')].map(c => (c.closest('label')?.innerText || c.id) + '=' + c.checked)))
await M.settled(w, 'x-explore-trg-window')
await L.press(w, '#inpEditSave'); await P.waitForTimeout(1200)
console.log('after save windows:', JSON.stringify(await M.anyWindowOpen(P)), 'questions:', JSON.stringify(await P.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().height > 0 && /docconf|oilconf/.test(e.dataset.testid)).map(e => e.dataset.testid))))
console.log('INPUTS Training:', JSON.stringify(await P.evaluate(() => (window.INPUTS || []).filter(r => r.type === 'Training' && JSON.stringify(r).includes('bane')))))
await P.evaluate(() => window.go('editsched')); await P.waitForTimeout(1500)
console.log('day2 sections:', JSON.stringify(await P.evaluate(() => { const d = document.querySelector('#eWeek section.day[data-day="2"]'); if (!d) return null; return { unav: d.querySelector('.sec-unav')?.innerText.replace(/\s+/g, ' ').slice(0, 200), grnd: d.querySelector('.sec-grnd')?.innerText.replace(/\s+/g, ' ').slice(0, 300), inp: d.querySelector('.sec-inp')?.innerText.replace(/\s+/g, ' ').slice(0, 300), pitog: !!d.querySelector('[data-pitog="2"]'), accb: [...d.querySelectorAll('.accb')].map(b => b.textContent.trim()) } })))
await M.settled(w, 'x-explore-es')
console.log('errs', w.errs)
await w.ctx.close(); await M.closeBrowser()
