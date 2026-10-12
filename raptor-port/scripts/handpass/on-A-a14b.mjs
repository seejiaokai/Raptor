import { world, usualSat, drag, frameGrnd, SAT_DI } from './on-A-lib.mjs'
const W = await world({ tag: 'A14b' })
const { page, tid, press, shot, errors } = W
await usualSat(W, { goToBoard: false })
await page.locator('#schedBoard').getByRole('button', { name: /Done/ }).first().click(); await page.waitForTimeout(600)
await frameGrnd(page, SAT_DI); await page.waitForTimeout(300)
const wk = i => `#eWeek .day:not(.peek) [data-slot="g:${SAT_DI}.${i}"] .puck`
await drag(page, page.locator(wk(1)), page.locator(wk(0)))
await press(tid('oilconf-cancel')); await page.waitForTimeout(800)
console.log('bar up', await tid('oilbar').count())
// Personal Inputs 'show'
const day = page.locator('#eWeek .day:not(.peek)').nth(SAT_DI)
const showB = day.getByText(/show/).first()
console.log('show toggle', await showB.count())
await showB.click().catch(e => console.log('show err', String(e).slice(0, 100))); await page.waitForTimeout(600)
const lines = await day.evaluate(d => [...d.querySelectorAll('.sec-inp *')].filter(e => e.children.length === 0 && e.textContent.trim() && e.getClientRects().length).map(e => e.tagName + '.' + e.className.toString().slice(0, 20) + ':' + e.textContent.trim().slice(0, 30)).slice(0, 15))
console.log('personal inputs section', JSON.stringify(lines))
await shot('A14b-1-personal-inputs')
const line = day.locator('.sec-inp button.inpedit').first()
console.log('line count', await line.count())
await line.click().catch(e => console.log('line err', String(e).slice(0, 100))); await page.waitForTimeout(800)
console.log('input window', await page.locator('#inpEditPop:not([hidden])').count(), 'bar', await tid('oilbar').count())
await shot('A14b-2-input-window-over-week')
if (await page.locator('#inpEditPop:not([hidden])').count() && await tid('oilbar').count()) {
  console.log('bar vs window', JSON.stringify(await page.evaluate(() => { const out = {}; for (const id of ['oilbar-answer', 'oilbar-ok']) { const e = document.querySelector(`[data-testid="${id}"]`); const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); out[id] = { box: [Math.round(r.left), Math.round(r.top)], hitSelf: h === e || e.contains(h) } } const p = document.getElementById('inpEditPop'); const pr = p.getBoundingClientRect(); out.pop = [Math.round(pr.left), Math.round(pr.top), Math.round(pr.width), Math.round(pr.height)]; return out })))
}
console.log('errors', JSON.stringify(errors))
await W.ctx.close(); process.exit(0)
