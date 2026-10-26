// probe: how the half-day credit reads in the cell, the clash note, the legend. VERSION 1
import { openWorld, tools } from './w2lib.mjs'
const w = await openWorld('desktop'); const { page } = w; const t = tools(w, 'p11')
await page.evaluate(() => { const W = window, di = 5; W.DAYS[di].ground.push({ prog: 'Range brief', str: '09:00', end: '12:00', who: '', rmks: '' }); W.afterSchedMutate(); W.fillSlot(`g:${di}.${W.DAYS[di].ground.length - 1}.+`, 'pump'); W.afterSchedMutate(); const g = W.signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'; W.setDayApproved(di, true); W.afterSchedMutate() })
await t.lw('JUL')
const c = '[data-testid="cell-pump-2026-07-18"]'
console.log('cell', JSON.stringify(await page.evaluate(s => { const e = document.querySelector(s); return { t: e.innerText, title: e.getAttribute('title'), html: e.innerHTML.slice(0, 300) } }, c)))
await t.press('[data-testid="legend-open"]'); await page.waitForTimeout(400)
console.log('legend half-day section', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.leg-sec, .leg-row')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(x => /half|AM|PM|\*/.test(x)))))
await t.shot('legend')
await w.browser.close()
