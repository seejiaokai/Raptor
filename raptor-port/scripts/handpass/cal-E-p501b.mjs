// P5-01 follow-up: a toast "Changed while this window was open: people — … added, Tally taken off" was seen in a picture. When does it appear?
import { launch, world, toInputs, toMonth, bar, shot, press } from './cal-E-lib.mjs'
const b = await launch()
const w = await world(b, 'desk'); const p = w.page
await toInputs(p); await toMonth(p, 2026, 7)
const sharedBar = p.locator('.ib-bar', { hasText: '+3' }).first()
const tallyIid = await p.evaluate(() => window.INPUTS.find(x => x.date === 'Jul 24' && !x.grp).iid)
const toasts = () => p.evaluate(() => [...document.querySelectorAll('[class*="toast"], #toast, [role="status"]')].map(e => e.innerText).filter(Boolean))
await press(p, 'desk', sharedBar); await p.waitForSelector('[data-testid="win-inputedit"]'); await p.waitForTimeout(300); await p.locator('#inpEditPop [data-pp="freak"]').scrollIntoViewIfNeeded(); await press(p, 'desk', p.locator('#inpEditPop [data-pp="freak"]')); await press(p, 'desk', bar(p, tallyIid)); await p.waitForTimeout(500); console.log('0 title now', await p.locator('[data-testid="win-inputedit"] .win-ttl').innerText())
console.log('1 Tally editor open; toasts:', JSON.stringify(await toasts()))
await p.locator('#inpEditCancel').click(); await p.waitForTimeout(500)
console.log('2 Cancel pressed; windows:', await p.locator('[data-testid="win-inputedit"]').count(), 'toasts:', JSON.stringify(await toasts()))
await press(p, 'desk', sharedBar); await p.waitForSelector('[data-testid="win-inputedit"]')
for (const t of [100, 400, 900]) { await p.waitForTimeout(t); console.log('3 shared entry opened (+' + t + 'ms) toasts:', JSON.stringify(await toasts())) }
await shot(p, 'p501b-1-shared-after-tally')
// the same, but first opening the shared entry cold (control)
await p.locator('#inpEditCancel').click(); await p.waitForTimeout(3500)
console.log('4 after Cancel and wait; toasts:', JSON.stringify(await toasts()))
await press(p, 'desk', sharedBar); await p.waitForSelector('[data-testid="win-inputedit"]'); await p.waitForTimeout(500)
console.log('5 shared opened again (after the shared was the last one open); toasts:', JSON.stringify(await toasts()))
console.log(w.errors)
await b.close()
