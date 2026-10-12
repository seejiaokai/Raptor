import { world, usualSat, groundNow, drag, toast, measure, openWeekDay, frameGrnd, SAT_DI } from './on-A-lib.mjs'
const W = await world({ tag: 'A14' })
const { page, tid, press, shot, errors } = W
const iid = await usualSat(W, { goToBoard: false })
await page.locator('#schedBoard').getByRole('button', { name: /Done/ }).first().click(); await page.waitForTimeout(600)
await frameGrnd(page, SAT_DI); await page.waitForTimeout(300)
const wk = i => `#eWeek .day:not(.peek) [data-slot="g:${SAT_DI}.${i}"] .puck`
await drag(page, page.locator(wk(1)), page.locator(wk(0)))
await press(tid('oilconf-cancel')); await page.waitForTimeout(3500)
console.log('bar up', await tid('oilbar').count())
const hits = async (label) => console.log(label, JSON.stringify(await page.evaluate(() => {
  const out = {}
  for (const id of ['oilbar-answer', 'oilbar-ok', 'oilbar']) {
    const e = document.querySelector(`[data-testid="${id}"]`); if (!e) { out[id] = 'absent'; continue }
    const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    out[id] = { box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], hitSelf: h === e || e.contains(h), hit: h ? (h.id || h.className.toString().slice(0, 40) + '|' + (h.closest('[data-testid]') || {getAttribute: () => ''}).getAttribute('data-testid')) : null, zIndex: getComputedStyle(e.closest('[data-testid="oilbar"]') || e).zIndex }
  }
  return out
})))
await hits('bar alone')
// the changes window: the clock button in the top bar
const clockInfo = await page.evaluate(() => [...document.querySelectorAll('.topbar button, #histBtn, #chgBtn')].filter(b => b.getClientRects().length).map(b => b.id + '|' + (b.title || b.getAttribute('aria-label') || '') + '|' + b.textContent.trim().slice(0, 12)).slice(0, 20))
console.log('topbar buttons', JSON.stringify(clockInfo))
const clock = page.locator('#histBtn')
console.log('clock found', await clock.count())
await clock.click(); await page.waitForTimeout(900)
const wins = await page.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(w => /win|chg|chang|hist/i.test(w.getAttribute('data-testid')) && w.getClientRects().length).map(w => { const r = w.getBoundingClientRect(); return w.getAttribute('data-testid') + ' ' + [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)].join(',') + ' z=' + getComputedStyle(w).zIndex }))
console.log('windows', JSON.stringify(wins))
await shot('A14-1-changes-window')
await hits('with changes window')
// move the changes window onto the bar so they truly overlap: drag its title bar
const winInfo = async () => { const t = page.getByText(/Changes · week of/).first(); if (!(await t.count())) return null; return t.evaluate(t => { let w = t; while (w && getComputedStyle(w).position !== 'fixed') w = w.parentElement; if (!w) return { nofixed: true }; const r = w.getBoundingClientRect(); const tr = t.getBoundingClientRect(); return { win: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], z: getComputedStyle(w).zIndex, title: [Math.round(tr.left + tr.width / 2), Math.round(tr.top + tr.height / 2)] } }) }
const wi = { title: [1130, 113] }
const bb = await tid('oilbar').boundingBox()
await page.mouse.move(wi.title[0], wi.title[1]); await page.mouse.down(); await page.mouse.move(wi.title[0] - 20, wi.title[1] + 20, { steps: 3 })
await page.mouse.move(700, 600, { steps: 15 }); await page.mouse.up(); await page.waitForTimeout(500)
console.log('bar', JSON.stringify(bb))
await shot('A14-2-overlap')
await hits('overlap')
// can Answer OIL and OK be pressed?
await press(tid('oilbar-answer')).catch(e => console.log('answer press err', String(e).slice(0, 150)))
await page.waitForTimeout(500)
console.log('after Answer OIL press: question', await tid('oilconf').count(), 'bar', await tid('oilbar').count())
await shot('A14-3-answer-with-window')
if (await tid('oilconf').count()) { await press(tid('oilconf-cancel')); await page.waitForTimeout(600) }
await press(tid('oilbar-ok')).catch(e => console.log('ok press err', String(e).slice(0, 150)))
await page.waitForTimeout(500)
console.log('after OK press: bar', await tid('oilbar').count())
// the Inputs day window over the week: tap Range brief's row name
await page.locator('#eWeek .day:not(.peek)').nth(SAT_DI).locator('.pl-row.gr-frominput .nm .ntx').first().click().catch(e => console.log('row tap err', String(e).slice(0, 100)))
await page.waitForTimeout(700)
console.log('input window opened', await page.locator('#inpEditPop:not([hidden])').count(), JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-testid^="win-"], #inpEditPop')].filter(e => e.getClientRects().length).map(e => (e.getAttribute('data-testid') || e.id)))))
await shot('A14-4-input-window')
console.log('errors', JSON.stringify(errors))
await W.ctx.close(); process.exit(0)
